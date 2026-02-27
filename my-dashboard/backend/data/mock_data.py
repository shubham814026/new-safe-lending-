"""
Mock data generator for the Data Analytics & Prediction Dashboard.
Generates realistic storytelling data for model drift analysis.
"""

import math
import random
from datetime import datetime, timedelta

random.seed(42)

# ─── HELPERS ──────────────────────────────────────────────────────────

def _date_str(day_offset: int, base: datetime | None = None) -> str:
    base = base or datetime(2026, 1, 1)
    return (base + timedelta(days=day_offset)).strftime("%Y-%m-%d")


# ═══════════════════════════════════════════════════════════════════════
# 1. TIMESERIES DATA  — 3 lines × 30 points
# ═══════════════════════════════════════════════════════════════════════

def generate_timeseries():
    labels = [_date_str(i * 2) for i in range(30)]
    series_a, series_b, series_c = [], [], []
    a, b, c = 120, 80, 200
    for i in range(30):
        a += random.uniform(-5, 7)
        b += random.uniform(-3, 5)
        c += random.uniform(-8, 4)
        series_a.append(round(a, 2))
        series_b.append(round(b, 2))
        series_c.append(round(c, 2))
    return {
        "labels": labels,
        "series": [
            {"name": "Revenue", "data": series_a, "color": "#06b6d4"},
            {"name": "Users", "data": series_b, "color": "#8b5cf6"},
            {"name": "Sessions", "data": series_c, "color": "#10b981"},
        ],
    }


# ═══════════════════════════════════════════════════════════════════════
# 2. BAR CHART DATA  — 8 categories × 3 groups
# ═══════════════════════════════════════════════════════════════════════

def generate_barchart():
    categories = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"
    ]
    groups = ["Product A", "Product B", "Product C"]
    data = []
    for cat in categories:
        values = {}
        for g in groups:
            values[g] = round(random.uniform(20, 100), 1)
        data.append({"category": cat, **values})
    return {"categories": categories, "groups": groups, "data": data}


# ═══════════════════════════════════════════════════════════════════════
# 3. SCATTER DATA  — 100 points in 4 clusters
# ═══════════════════════════════════════════════════════════════════════

def generate_scatter():
    clusters = [
        {"cx": 20, "cy": 80, "label": "Cluster A", "color": "#06b6d4"},
        {"cx": 70, "cy": 70, "label": "Cluster B", "color": "#8b5cf6"},
        {"cx": 30, "cy": 30, "label": "Cluster C", "color": "#10b981"},
        {"cx": 75, "cy": 25, "label": "Cluster D", "color": "#f59e0b"},
    ]
    points = []
    for i in range(100):
        cl = clusters[i % 4]
        points.append(
            {
                "x": round(cl["cx"] + random.gauss(0, 8), 2),
                "y": round(cl["cy"] + random.gauss(0, 8), 2),
                "size": round(random.uniform(3, 15), 1),
                "cluster": cl["label"],
                "color": cl["color"],
                "id": i,
            }
        )
    return {"points": points, "clusters": [c["label"] for c in clusters]}


# ═══════════════════════════════════════════════════════════════════════
# 4. HEATMAP DATA  — 12 rows × 8 cols
# ═══════════════════════════════════════════════════════════════════════

def generate_heatmap():
    rows = [f"Feature {chr(65+i)}" for i in range(12)]
    cols = [f"Week {i+1}" for i in range(8)]
    matrix = []
    for r in range(12):
        row_data = []
        for c in range(8):
            val = round(
                50 + 30 * math.sin(r * 0.5 + c * 0.4) + random.uniform(-10, 10),
                1,
            )
            row_data.append(max(0, min(100, val)))
        matrix.append(row_data)
    return {"rows": rows, "cols": cols, "matrix": matrix}


# ═══════════════════════════════════════════════════════════════════════
# 5. STAT CARDS
# ═══════════════════════════════════════════════════════════════════════

def generate_stats():
    return [
        {
            "title": "Total Data Points",
            "value": 124853,
            "change": 12.4,
            "trend": "up",
            "icon": "database",
            "color": "#06b6d4",
        },
        {
            "title": "Model Accuracy",
            "value": 78.3,
            "suffix": "%",
            "change": -3.2,
            "trend": "down",
            "icon": "target",
            "color": "#8b5cf6",
        },
        {
            "title": "Drift Score",
            "value": 42,
            "change": 18.7,
            "trend": "up",
            "icon": "activity",
            "color": "#f59e0b",
        },
        {
            "title": "Confidence",
            "value": 91.2,
            "suffix": "%",
            "change": -1.1,
            "trend": "down",
            "icon": "shield",
            "color": "#10b981",
        },
    ]


# ═══════════════════════════════════════════════════════════════════════
# 6. DRIFT HISTORY  — 60 days accuracy + drift score
# ═══════════════════════════════════════════════════════════════════════

def generate_drift_history():
    days = []
    for d in range(60):
        t = d / 59  # 0→1
        accuracy = 94 - 16 * t + random.uniform(-1.2, 1.2)
        drift_score = 8 + 59 * t + random.uniform(-2, 2)
        days.append(
            {
                "date": _date_str(d),
                "accuracy": round(max(70, min(96, accuracy)), 2),
                "drift_score": round(max(0, min(80, drift_score)), 2),
                "day": d + 1,
            }
        )
    return days


# ═══════════════════════════════════════════════════════════════════════
# 7. DRIFT PREDICTION  — 30 future days with confidence intervals
# ═══════════════════════════════════════════════════════════════════════

def generate_drift_prediction():
    last_accuracy = 78.0
    predictions = []
    for d in range(30):
        t = d / 29
        predicted = last_accuracy - 8 * t + random.uniform(-0.8, 0.5)
        spread = 2 + 6 * t  # widening CI
        predictions.append(
            {
                "date": _date_str(60 + d),
                "predicted_accuracy": round(max(55, predicted), 2),
                "upper_bound": round(min(95, predicted + spread), 2),
                "lower_bound": round(max(50, predicted - spread), 2),
                "drift_score": round(67 + 15 * t + random.uniform(-1, 1), 2),
                "day": 61 + d,
            }
        )
    return predictions


# ═══════════════════════════════════════════════════════════════════════
# 8. FEATURE IMPORTANCE / DRIFT SCORES
# ═══════════════════════════════════════════════════════════════════════

def generate_feature_drift():
    features = [
        {"name": "income_ratio", "importance": 0.23, "drift_score": 72, "status": "critical"},
        {"name": "credit_score", "importance": 0.19, "drift_score": 58, "status": "warning"},
        {"name": "loan_amount", "importance": 0.15, "drift_score": 45, "status": "warning"},
        {"name": "employment_len", "importance": 0.11, "drift_score": 31, "status": "safe"},
        {"name": "debt_to_income", "importance": 0.09, "drift_score": 64, "status": "critical"},
        {"name": "num_accounts", "importance": 0.07, "drift_score": 22, "status": "safe"},
        {"name": "payment_history", "importance": 0.06, "drift_score": 51, "status": "warning"},
        {"name": "age", "importance": 0.04, "drift_score": 12, "status": "safe"},
        {"name": "residence_type", "importance": 0.03, "drift_score": 38, "status": "warning"},
        {"name": "inquiry_count", "importance": 0.03, "drift_score": 67, "status": "critical"},
    ]
    return features


# ═══════════════════════════════════════════════════════════════════════
# 9. ALERTS
# ═══════════════════════════════════════════════════════════════════════

def generate_alerts():
    return [
        {
            "id": 1,
            "severity": "critical",
            "message": "Model accuracy dropped below 80% threshold. Immediate retraining recommended.",
            "timestamp": "2026-02-27T08:14:00Z",
            "feature": "income_ratio",
        },
        {
            "id": 2,
            "severity": "warning",
            "message": "Feature 'credit_score' distribution shift detected (PSI = 0.31).",
            "timestamp": "2026-02-26T14:45:00Z",
            "feature": "credit_score",
        },
        {
            "id": 3,
            "severity": "warning",
            "message": "Prediction confidence interval widening — uncertainty increasing.",
            "timestamp": "2026-02-25T11:30:00Z",
            "feature": None,
        },
        {
            "id": 4,
            "severity": "info",
            "message": "Scheduled data pipeline completed successfully. 12,483 new records ingested.",
            "timestamp": "2026-02-25T06:00:00Z",
            "feature": None,
        },
        {
            "id": 5,
            "severity": "info",
            "message": "Model v2.1 performance baseline established. Monitoring active.",
            "timestamp": "2026-02-24T09:00:00Z",
            "feature": None,
        },
        {
            "id": 6,
            "severity": "warning",
            "message": "Data quality check: 0.3% null values detected in 'debt_to_income' column.",
            "timestamp": "2026-02-23T17:22:00Z",
            "feature": "debt_to_income",
        },
    ]


# ═══════════════════════════════════════════════════════════════════════
# 10. CURRENT DRIFT STATUS
# ═══════════════════════════════════════════════════════════════════════

def generate_current_drift():
    return {
        "score": 42,
        "status": "warning",
        "accuracy": 78.3,
        "last_updated": "2026-02-27T08:14:00Z",
        "model_name": "XGBoost v2.1",
        "threshold_safe": 30,
        "threshold_warning": 60,
        "threshold_critical": 80,
    }
