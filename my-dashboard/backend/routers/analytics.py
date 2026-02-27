"""
Analytics API Router — serves real lending data for the dashboard charts.
"""

from fastapi import APIRouter
from data.analytics_processor import (
    compute_stats,
    compute_grade_drift,
    compute_rate_alignment,
    compute_profile_drift,
    compute_geographic,
    compute_verification,
    compute_drift_score,
    compute_loan_status_distribution,
    compute_loan_volume,
)

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/stats")
def get_stats():
    return compute_stats()


@router.get("/grade-drift")
def get_grade_drift():
    return compute_grade_drift()


@router.get("/rate-alignment")
def get_rate_alignment():
    return compute_rate_alignment()


@router.get("/profile-drift")
def get_profile_drift():
    return compute_profile_drift()


@router.get("/geographic")
def get_geographic():
    return compute_geographic()


@router.get("/verification")
def get_verification():
    return compute_verification()


@router.get("/drift-score")
def get_drift_score():
    return compute_drift_score()


@router.get("/loan-status")
def get_loan_status():
    return compute_loan_status_distribution()


@router.get("/loan-volume")
def get_loan_volume():
    return compute_loan_volume()
