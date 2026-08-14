"""
Lending Club Data Loader — mirrors the notebook logic.
Loads once at startup, caches in memory.  Uses NROWS to limit
rows during development (set to None for full data).
"""

import gc
import os
import numpy as np
import pandas as pd

# ── CONSTANTS ──────────────────────────────────────────────

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "lending_model", "data")
NROWS = int(os.environ.get("NROWS", "200000"))  # 200k rows for fast dev & instant response

DEFAULT_STATUSES = [
    "Charged Off",
    "Default",
    "Does not meet the credit policy. Status:Charged Off",
]
PAID_STATUSES = [
    "Fully Paid",
    "Does not meet the credit policy. Status:Fully Paid",
]

APPLICATION_FEATURES = [
    "loan_amnt", "term", "purpose",
    "annual_inc", "dti", "emp_length", "home_ownership", "verification_status",
    "fico_range_low", "fico_range_high",
    "delinq_2yrs", "inq_last_6mths", "open_acc", "pub_rec",
    "revol_bal", "revol_util", "total_acc",
    "mths_since_last_delinq", "mths_since_last_record",
    "collections_12_mths_ex_med", "acc_now_delinq",
    "grade",
    "issue_year",
]

# ── GLOBAL CACHE ───────────────────────────────────────────

_cache: dict = {}


def _resolve_path(filename: str) -> str:
    return os.path.normpath(os.path.join(DATA_DIR, filename))


def load_master() -> pd.DataFrame:
    """Load & merge the 6 CSVs exactly as the notebook does. Cached."""
    if "df" in _cache:
        return _cache["df"]

    print("[lending_loader] Loading CSVs …")

    loan_core = pd.read_csv(_resolve_path("loan_core.csv"), nrows=NROWS, low_memory=False)
    borrower = pd.read_csv(_resolve_path("borrower_profile.csv"), nrows=NROWS, low_memory=False)
    credit = pd.read_csv(_resolve_path("credit_history.csv"), nrows=NROWS, low_memory=False)
    balances = pd.read_csv(_resolve_path("account_balances.csv"), nrows=NROWS, low_memory=False)
    activity = pd.read_csv(_resolve_path("account_activity.csv"), nrows=NROWS, low_memory=False)
    extra = pd.read_csv(_resolve_path("extra_unassigned.csv"), nrows=NROWS, low_memory=False)

    tables = [
        loan_core,
        borrower.drop(columns="id", errors="ignore"),
        credit.drop(columns="id", errors="ignore"),
        balances.drop(columns="id", errors="ignore"),
        activity.drop(columns="id", errors="ignore"),
        extra,
    ]
    df = pd.concat(tables, axis=1)
    df = df.drop(columns="id", errors="ignore")

    # Drop duplicate columns
    dupes = df.columns[df.columns.duplicated()].tolist()
    if dupes:
        df = df.loc[:, ~df.columns.duplicated(keep="first")]

    del loan_core, borrower, credit, balances, activity, extra, tables
    gc.collect()

    # Parse dates
    df["issue_d"] = pd.to_datetime(df["issue_d"], format="%b-%Y", errors="coerce")
    df["issue_year"] = df["issue_d"].dt.year

    # Binary default flag
    df["is_default"] = np.where(
        df["loan_status"].isin(DEFAULT_STATUSES), 1,
        np.where(df["loan_status"].isin(PAID_STATUSES), 0, np.nan),
    )

    _cache["df"] = df
    print(f"[lending_loader] Master: {df.shape[0]:,} rows × {df.shape[1]} cols")
    return df


def get_closed() -> pd.DataFrame:
    """Only fully-resolved loans (paid or defaulted)."""
    if "df_closed" in _cache:
        return _cache["df_closed"]
    df = load_master()
    df_closed = df[df["is_default"].notna()].copy()
    _cache["df_closed"] = df_closed
    return df_closed


def get_analysis() -> pd.DataFrame:
    """Maturity-filtered analysis set (≥80 % closure, ≥500 loans/year)."""
    if "df_analysis" in _cache:
        return _cache["df_analysis"]

    df = load_master()
    df_closed = get_closed()

    df_analysis = df_closed.copy()
    df_analysis["int_rate_clean"] = pd.to_numeric(df_analysis["int_rate"], errors="coerce")

    # Maturity filter
    year_closure = (
        df.groupby("issue_year")["is_default"]
        .apply(lambda x: x.notna().mean())
        .reset_index()
    )
    year_closure.columns = ["issue_year", "pct_closed"]
    mature_years = year_closure[year_closure["pct_closed"] >= 0.80]["issue_year"].values
    df_analysis = df_analysis[df_analysis["issue_year"].isin(mature_years)].copy()

    # Volume filter
    year_counts = df_analysis["issue_year"].value_counts()
    valid_years = year_counts[year_counts >= 500].index
    df_analysis = df_analysis[df_analysis["issue_year"].isin(valid_years)].copy()

    _cache["df_analysis"] = df_analysis
    print(f"[lending_loader] Analysis: {len(df_analysis):,} rows")
    return df_analysis


def preload():
    """Call at startup to warm the cache."""
    load_master()
    get_closed()
    get_analysis()
    print("[lending_loader] ✅ All data cached")
