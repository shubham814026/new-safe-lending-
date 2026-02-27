"""
ML Processor — trains the Random Forest from the notebook and
produces all prediction-page data.  Runs once, caches results.
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import roc_auc_score, roc_curve, classification_report, confusion_matrix

from data.lending_loader import get_closed, get_analysis, APPLICATION_FEATURES

_ml_cache: dict = {}


def _train_model():
    """Train the RF once and cache everything."""
    if "trained" in _ml_cache:
        return

    print("[ml_processor] Training Random Forest …")
    df_closed = get_closed()

    available = [c for c in APPLICATION_FEATURES if c in df_closed.columns]
    df_ml = df_closed[available + ["is_default"]].copy()

    cat_cols = ["purpose", "home_ownership", "verification_status",
                "emp_length", "term", "grade"]
    cat_cols = [c for c in cat_cols if c in df_ml.columns]
    label_encoders = {}
    for col in cat_cols:
        le = LabelEncoder()
        df_ml[col] = le.fit_transform(df_ml[col].astype(str))
        label_encoders[col] = le

    X = df_ml.drop("is_default", axis=1)
    y = df_ml["is_default"].astype(int)

    imputer = SimpleImputer(strategy="median")
    X_imp = pd.DataFrame(imputer.fit_transform(X), columns=X.columns)

    X_train, X_test, y_train, y_test = train_test_split(
        X_imp, y, test_size=0.2, random_state=42, stratify=y
    )

    # Sample for speed if large
    MAX_ROWS = 300_000
    if len(X_train) > MAX_ROWS:
        idx = np.random.choice(len(X_train), MAX_ROWS, replace=False)
        X_tr = X_train.iloc[idx]
        y_tr = y_train.iloc[idx]
    else:
        X_tr, y_tr = X_train, y_train

    rf = RandomForestClassifier(
        n_estimators=200, max_depth=12,
        min_samples_leaf=50, class_weight="balanced",
        random_state=42, n_jobs=-1,
    )
    rf.fit(X_tr, y_tr)

    y_pred_proba = rf.predict_proba(X_test)[:, 1]
    y_pred = (y_pred_proba >= 0.5).astype(int)
    auc = roc_auc_score(y_test, y_pred_proba)
    fpr, tpr, _ = roc_curve(y_test, y_pred_proba)
    cm = confusion_matrix(y_test, y_pred)
    report = classification_report(y_test, y_pred,
                                   target_names=["Paid Off", "Defaulted"],
                                   output_dict=True)

    # Feature importance
    importance = pd.DataFrame({
        "feature": X.columns,
        "importance": rf.feature_importances_,
    }).sort_values("importance", ascending=False)

    _ml_cache.update({
        "trained": True,
        "model": rf,
        "imputer": imputer,
        "label_encoders": label_encoders,
        "features": list(X.columns),
        "auc": round(auc, 4),
        "fpr": fpr,
        "tpr": tpr,
        "confusion_matrix": cm,
        "report": report,
        "importance": importance,
        "X_test": X_test,
        "y_test": y_test,
    })
    print(f"[ml_processor] ✅ AUC = {auc:.4f}")


# ─────────────────────────────────────────────
# Temporal decay analysis
# ─────────────────────────────────────────────

def _train_temporal():
    if "decay_results" in _ml_cache:
        return
    _train_model()

    print("[ml_processor] Running temporal decay analysis …")
    da = get_analysis()
    df_closed = get_closed()

    cat_cols = ["purpose", "home_ownership", "verification_status",
                "emp_length", "term"]
    available = [c for c in APPLICATION_FEATURES if c != "grade" and c != "issue_year" and c in da.columns]

    df_t = da[available + ["is_default", "issue_year"]].copy()
    for col in [c for c in cat_cols if c in available]:
        le = LabelEncoder()
        df_t[col] = le.fit_transform(df_t[col].astype(str))

    train_years = [2009, 2010, 2011]
    train_mask = df_t["issue_year"].isin(train_years)
    X_base = df_t[train_mask].drop(["is_default", "issue_year"], axis=1)
    y_base = df_t[train_mask]["is_default"].astype(int)

    imp = SimpleImputer(strategy="median")
    X_base_imp = imp.fit_transform(X_base)

    rf_t = RandomForestClassifier(
        n_estimators=150, max_depth=10,
        class_weight="balanced", random_state=42, n_jobs=-1,
    )
    rf_t.fit(X_base_imp, y_base)

    # Compute true default rate from ALL closed loans (not just maturity-filtered)
    true_default_by_year = (
        df_closed.groupby("issue_year")["is_default"]
        .mean()
        .to_dict()
    )

    results = []
    # Match the notebook: only test years 2009–2015
    for test_year in range(2009, 2016):
        mask = df_t["issue_year"] == test_year
        if mask.sum() < 200:
            continue
        X_t = df_t[mask].drop(["is_default", "issue_year"], axis=1)
        y_t = df_t[mask]["is_default"].astype(int)
        X_t_imp = imp.transform(X_t)
        try:
            auc_t = roc_auc_score(y_t, rf_t.predict_proba(X_t_imp)[:, 1])
            # Use the true default rate from the full closed dataset
            true_dr = true_default_by_year.get(test_year, y_t.mean())
            results.append({
                "year": test_year,
                "auc": round(auc_t, 4),
                "default_rate": round(float(true_dr) * 100, 2),
                "n_samples": int(mask.sum()),
            })
        except Exception:
            pass

    _ml_cache["decay_results"] = results
    print(f"[ml_processor] ✅ Temporal decay: {len(results)} years")


# ═══════════════════════════════════════════════
# PUBLIC API
# ═══════════════════════════════════════════════

def get_feature_importance() -> dict:
    _train_model()
    imp = _ml_cache["importance"]
    features = []
    for _, row in imp.iterrows():
        features.append({
            "name": row["feature"],
            "importance": round(float(row["importance"]), 4),
        })
    return {
        "title": "Feature Importance — Random Forest",
        "auc": _ml_cache["auc"],
        "features": features,
    }


def get_roc_curve() -> dict:
    _train_model()
    fpr = _ml_cache["fpr"]
    tpr = _ml_cache["tpr"]
    # Downsample for JSON
    step = max(1, len(fpr) // 200)
    return {
        "title": "ROC Curve — Default Prediction",
        "auc": _ml_cache["auc"],
        "fpr": [round(float(x), 4) for x in fpr[::step]],
        "tpr": [round(float(x), 4) for x in tpr[::step]],
    }


def get_confusion_matrix() -> dict:
    _train_model()
    cm = _ml_cache["confusion_matrix"]
    return {
        "title": "Confusion Matrix",
        "matrix": cm.tolist(),
        "labels": ["Paid Off", "Defaulted"],
    }


def get_classification_report() -> dict:
    _train_model()
    report = _ml_cache["report"]
    rows = []
    for label in ["Paid Off", "Defaulted"]:
        if label in report:
            r = report[label]
            rows.append({
                "label": label,
                "precision": round(r.get("precision", 0), 4),
                "recall": round(r.get("recall", 0), 4),
                "f1": round(r.get("f1-score", 0), 4),
                "support": int(r.get("support", 0)),
            })
    return {
        "title": "Classification Report",
        "auc": _ml_cache["auc"],
        "rows": rows,
        "accuracy": round(report.get("accuracy", 0), 4),
    }


def get_temporal_decay() -> dict:
    _train_temporal()
    results = _ml_cache["decay_results"]
    years = []
    for r in results:
        years.append({
            "year": r["year"],
            "auc": r["auc"],
            "default_rate": r["default_rate"],
            "n_samples": r.get("n_samples", 0),
        })
    return {
        "title": "Model Temporal Decay: Train 2009-2011, Test Each Year",
        "years": years,
        "train_years": [2009, 2010, 2011],
    }


def get_model_summary() -> dict:
    _train_model()
    return {
        "model_name": "RandomForest",
        "model_type": "RandomForestClassifier",
        "n_estimators": 200,
        "max_depth": 12,
        "auc": _ml_cache["auc"],
        "n_features": len(_ml_cache["features"]),
        "train_samples": len(_ml_cache.get("X_test", [])) * 4,
        "features": _ml_cache["features"],
    }
