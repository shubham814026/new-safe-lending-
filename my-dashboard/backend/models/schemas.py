"""
Pydantic schemas for API responses.
"""

from pydantic import BaseModel
from typing import Optional


# ─── Timeseries ───────────────────────────────────────────────────────

class SeriesItem(BaseModel):
    name: str
    data: list[float]
    color: str


class TimeseriesResponse(BaseModel):
    labels: list[str]
    series: list[SeriesItem]


# ─── Bar Chart ────────────────────────────────────────────────────────

class BarChartResponse(BaseModel):
    categories: list[str]
    groups: list[str]
    data: list[dict]


# ─── Scatter ──────────────────────────────────────────────────────────

class ScatterPoint(BaseModel):
    x: float
    y: float
    size: float
    cluster: str
    color: str
    id: int


class ScatterResponse(BaseModel):
    points: list[ScatterPoint]
    clusters: list[str]


# ─── Heatmap ──────────────────────────────────────────────────────────

class HeatmapResponse(BaseModel):
    rows: list[str]
    cols: list[str]
    matrix: list[list[float]]


# ─── Stat Card ────────────────────────────────────────────────────────

class StatCardItem(BaseModel):
    title: str
    value: float
    suffix: Optional[str] = None
    change: float
    trend: str
    icon: str
    color: str


# ─── Drift History ───────────────────────────────────────────────────

class DriftHistoryPoint(BaseModel):
    date: str
    accuracy: float
    drift_score: float
    day: int


# ─── Drift Prediction ───────────────────────────────────────────────

class DriftPredictionPoint(BaseModel):
    date: str
    predicted_accuracy: float
    upper_bound: float
    lower_bound: float
    drift_score: float
    day: int


# ─── Feature Drift ──────────────────────────────────────────────────

class FeatureDrift(BaseModel):
    name: str
    importance: float
    drift_score: int
    status: str


# ─── Alert ───────────────────────────────────────────────────────────

class AlertItem(BaseModel):
    id: int
    severity: str
    message: str
    timestamp: str
    feature: Optional[str] = None


# ─── Current Drift ──────────────────────────────────────────────────

class CurrentDrift(BaseModel):
    score: int
    status: str
    accuracy: float
    last_updated: str
    model_name: str
    threshold_safe: int
    threshold_warning: int
    threshold_critical: int
