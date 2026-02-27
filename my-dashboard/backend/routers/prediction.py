"""
Prediction / ML API Router — serves model performance & drift data.
"""

from fastapi import APIRouter
from data.ml_processor import (
    get_feature_importance,
    get_roc_curve,
    get_confusion_matrix,
    get_classification_report,
    get_temporal_decay,
    get_model_summary,
)
from data.analytics_processor import compute_drift_score

router = APIRouter(prefix="/api/prediction", tags=["prediction"])


@router.get("/feature-importance")
def feature_importance():
    return get_feature_importance()


@router.get("/roc-curve")
def roc_curve_data():
    return get_roc_curve()


@router.get("/confusion-matrix")
def confusion_matrix_data():
    return get_confusion_matrix()


@router.get("/classification-report")
def classification_report_data():
    return get_classification_report()


@router.get("/temporal-decay")
def temporal_decay():
    return get_temporal_decay()


@router.get("/model-summary")
def model_summary():
    return get_model_summary()


@router.get("/drift-score")
def drift_score():
    return compute_drift_score()
