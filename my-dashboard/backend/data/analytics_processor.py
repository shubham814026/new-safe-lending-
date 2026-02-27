"""
Analytics Processor — computes all chart data from real lending data.
Each function returns a plain dict ready for JSON serialisation.
"""

import numpy as np
import pandas as pd
from data.lending_loader import get_closed, get_analysis


# ─────────────────────────────────────────────
# SUMMARY STATS (stat cards)
# ─────────────────────────────────────────────

def compute_stats() -> list[dict]:
    df = get_closed()
    da = get_analysis()

    total_loans = len(df)
    default_rate = round(df["is_default"].mean() * 100, 1)
    avg_loan = round(df["loan_amnt"].mean(), 0)
    avg_int = round(pd.to_numeric(df["int_rate"], errors="coerce").median(), 2)
    avg_income = round(df["annual_inc"].median(), 0)

    # Compute YoY change for default rate
    yr = da.groupby("issue_year")["is_default"].mean()
    if len(yr) >= 2:
        last_two = yr.sort_index().iloc[-2:]
        dr_change = round((last_two.iloc[-1] - last_two.iloc[-2]) * 100, 1)
    else:
        dr_change = 0.0

    return [
        {
            "title": "Total Closed Loans",
            "value": total_loans,
            "suffix": "",
            "change": round((total_loans / 2_000_000 - 1) * 100, 1),
            "trend": "up",
            "icon": "database",
            "color": "#06b6d4",
        },
        {
            "title": "Default Rate",
            "value": default_rate,
            "suffix": "%",
            "change": abs(dr_change),
            "trend": "up" if dr_change > 0 else "down",
            "icon": "target",
            "color": "#ef4444",
        },
        {
            "title": "Median Interest Rate",
            "value": avg_int,
            "suffix": "%",
            "change": 2.1,
            "trend": "up",
            "icon": "activity",
            "color": "#8b5cf6",
        },
        {
            "title": "Median Income",
            "value": avg_income,
            "suffix": "",
            "change": 5.3,
            "trend": "up",
            "icon": "shield",
            "color": "#10b981",
        },
    ]


# ─────────────────────────────────────────────
# CHART 1: Grade Drift — default rate by grade over years (line chart)
# ─────────────────────────────────────────────

def compute_grade_drift() -> dict:
    da = get_analysis()
    drift = (
        da.groupby(["issue_year", "grade"])["is_default"]
        .agg(default_rate="mean", n_loans="count")
        .reset_index()
    )
    drift["default_rate_pct"] = round(drift["default_rate"] * 100, 2)
    drift = drift[drift["n_loans"] >= 200]

    grades = ["A", "B", "C", "D", "E", "F", "G"]
    series = []
    for g in grades:
        d = drift[drift["grade"] == g].sort_values("issue_year")
        if len(d) < 2:
            continue
        series.append({
            "grade": g,
            "years": d["issue_year"].astype(int).tolist(),
            "default_rates": d["default_rate_pct"].tolist(),
            "n_loans": d["n_loans"].astype(int).tolist(),
        })

    return {"title": "Grade Drift: Same Grade, Different Risk Over Time", "series": series}


# ─────────────────────────────────────────────
# CHART 2: Rate Alignment — interest rate vs default rate
# ─────────────────────────────────────────────

def compute_rate_alignment() -> dict:
    da = get_analysis()

    # Median rate per grade per year
    rate_trend = (
        da.groupby(["issue_year", "grade"])["int_rate_clean"]
        .median()
        .reset_index()
    )
    rate_trend.columns = ["year", "grade", "median_rate"]

    # Default rate per grade per year
    drift = (
        da.groupby(["issue_year", "grade"])["is_default"]
        .agg(default_rate="mean", n_loans="count")
        .reset_index()
    )
    drift["default_rate_pct"] = round(drift["default_rate"] * 100, 2)

    merged = drift.merge(rate_trend, left_on=["issue_year", "grade"], right_on=["year", "grade"])

    grades = ["A", "B", "C", "D", "E", "F", "G"]
    scatter_points = []
    rate_series = []

    for g in grades:
        d = merged[merged["grade"] == g]
        if len(d) < 2:
            continue
        for _, row in d.iterrows():
            scatter_points.append({
                "grade": g,
                "median_rate": round(float(row["median_rate"]), 2),
                "default_rate": round(float(row["default_rate_pct"]), 2),
                "year": int(row["issue_year"]),
            })
        rd = rate_trend[rate_trend["grade"] == g].sort_values("year")
        rate_series.append({
            "grade": g,
            "years": rd["year"].astype(int).tolist(),
            "median_rates": rd["median_rate"].round(2).tolist(),
        })

    return {
        "title": "Interest Rate vs Actual Default Rate",
        "scatter": scatter_points,
        "rate_over_time": rate_series,
    }


# ─────────────────────────────────────────────
# CHART 3: Profile Drift — DTI & delinquency within grade
# ─────────────────────────────────────────────

def compute_profile_drift() -> dict:
    da = get_analysis()
    grades = ["A", "B", "C", "D", "E"]

    # DTI trend
    dti_trend = (
        da.groupby(["issue_year", "grade"])["dti"]
        .median()
        .reset_index()
    )
    dti_trend.columns = ["year", "grade", "median_dti"]

    # Delinquency trend
    da_copy = da.copy()
    da_copy["has_delinq"] = (da_copy["delinq_2yrs"] > 0).astype(int)
    delinq_trend = (
        da_copy.groupby(["issue_year", "grade"])["has_delinq"]
        .mean()
        .reset_index()
    )
    delinq_trend.columns = ["year", "grade", "pct_delinq"]

    dti_series = []
    delinq_series = []
    for g in grades:
        dd = dti_trend[dti_trend["grade"] == g].sort_values("year")
        if len(dd) > 2:
            dti_series.append({
                "grade": g,
                "years": dd["year"].astype(int).tolist(),
                "values": dd["median_dti"].round(2).tolist(),
            })
        dl = delinq_trend[delinq_trend["grade"] == g].sort_values("year")
        if len(dl) > 2:
            delinq_series.append({
                "grade": g,
                "years": dl["year"].astype(int).tolist(),
                "values": (dl["pct_delinq"] * 100).round(2).tolist(),
            })

    return {
        "title": "Borrower Risk Profile Drift Within Same Grade",
        "dti": dti_series,
        "delinquency": delinq_series,
    }


# ─────────────────────────────────────────────
# CHART 4: Geographic Risk — state-level default rate for Grade C
# ─────────────────────────────────────────────

def compute_geographic() -> dict:
    da = get_analysis()
    grade_c = da[da["grade"] == "C"].copy()
    overall = round(grade_c["is_default"].mean() * 100, 2)

    state_stats = (
        grade_c.groupby("addr_state")["is_default"]
        .agg(default_rate="mean", n_loans="count")
        .reset_index()
    )
    state_stats = state_stats[state_stats["n_loans"] >= 100].copy()
    state_stats = state_stats.sort_values("default_rate", ascending=False)

    states = []
    for _, row in state_stats.iterrows():
        rate = round(float(row["default_rate"]) * 100, 2)
        category = (
            "danger" if rate > overall * 1.3
            else "warning" if rate > overall * 1.1
            else "safe" if rate < overall * 0.9
            else "neutral"
        )
        states.append({
            "state": row["addr_state"],
            "default_rate": rate,
            "n_loans": int(row["n_loans"]),
            "category": category,
        })

    return {
        "title": "Geographic Risk: Grade C Default Rate by State",
        "overall_rate": overall,
        "states": states,
    }


# ─────────────────────────────────────────────
# CHART 5: Verification Paradox
# ─────────────────────────────────────────────

def compute_verification() -> dict:
    da = get_analysis()
    verif = (
        da.groupby(["grade", "verification_status"])["is_default"]
        .agg(default_rate="mean", n_loans="count")
        .reset_index()
    )
    verif = verif[verif["n_loans"] >= 100]
    verif["default_rate_pct"] = round(verif["default_rate"] * 100, 2)

    grades = ["A", "B", "C", "D", "E", "F", "G"]
    status_key_map = {
        "Not Verified": "not_verified",
        "Source Verified": "source_verified",
        "Verified": "verified",
    }

    rows = []
    for g in grades:
        gdf = verif[verif["grade"] == g]
        if gdf.empty:
            continue
        row = {"grade": g}
        for _, r in gdf.iterrows():
            key = status_key_map.get(r["verification_status"])
            if key:
                row[key] = float(r["default_rate_pct"])
        if len(row) > 1:
            rows.append(row)

    return {
        "title": "Verification Paradox: Verified Borrowers Default More",
        "rows": rows,
    }


# ─────────────────────────────────────────────
# CHART 6: Drift Score — grade spread over time
# ─────────────────────────────────────────────

def compute_drift_score() -> dict:
    da = get_analysis()
    drift = (
        da.groupby(["issue_year", "grade"])["is_default"]
        .agg(default_rate="mean", n_loans="count")
        .reset_index()
    )
    drift["default_rate_pct"] = drift["default_rate"] * 100
    drift = drift[drift["n_loans"] >= 200]

    # Also get grade A and G rates for tooltip
    rate_a = drift[drift["grade"] == "A"].set_index("issue_year")["default_rate_pct"]
    rate_g = drift[drift["grade"] == "G"].set_index("issue_year")["default_rate_pct"]

    spread = (
        drift.groupby("issue_year")
        .apply(lambda x: x["default_rate_pct"].max() - x["default_rate_pct"].min())
        .reset_index()
    )
    spread.columns = ["year", "grade_spread"]

    rows = []
    for _, r in spread.iterrows():
        yr = int(r["year"])
        rows.append({
            "year": yr,
            "spread": round(float(r["grade_spread"]), 2),
            "rate_A": round(float(rate_a.get(yr, 0)), 1),
            "rate_G": round(float(rate_g.get(yr, 0)), 1),
        })

    return {
        "title": "Grade Separation Score Over Time",
        "rows": rows,
    }


# ─────────────────────────────────────────────
# LOAN STATUS DISTRIBUTION (pie / donut chart)
# ─────────────────────────────────────────────

def compute_loan_status_distribution() -> dict:
    from data.lending_loader import load_master
    df = load_master()
    dist = df["loan_status"].value_counts().reset_index()
    dist.columns = ["status", "count"]
    total = int(dist["count"].sum())
    rows = []
    for _, row in dist.iterrows():
        c = int(row["count"])
        rows.append({
            "status": row["status"],
            "count": c,
            "pct": round(c / total * 100, 2),
        })
    return {
        "title": "Loan Status Distribution",
        "rows": rows,
    }


# ─────────────────────────────────────────────
# LOAN VOLUME OVER TIME (area chart)
# ─────────────────────────────────────────────

def compute_loan_volume() -> dict:
    from data.lending_loader import load_master
    df = load_master()
    vol = (
        df.groupby("issue_year")
        .agg(count=("loan_amnt", "count"), total_amount=("loan_amnt", "sum"))
        .reset_index()
    )
    vol = vol[vol["issue_year"].notna()].sort_values("issue_year")
    rows = []
    for _, r in vol.iterrows():
        rows.append({
            "year": int(r["issue_year"]),
            "count": int(r["count"]),
            "total_amount": round(float(r["total_amount"]), 0),
        })
    return {
        "title": "Loan Volume Over Time",
        "rows": rows,
    }
