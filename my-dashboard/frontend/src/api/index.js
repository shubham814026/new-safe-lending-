import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 120000, // data loading can take time on first request
  headers: { 'Content-Type': 'application/json' },
});

// ─── Analytics Endpoints ────────────────────────────────────────────

export const fetchStats = () => api.get('/analytics/stats');
export const fetchGradeDrift = () => api.get('/analytics/grade-drift');
export const fetchRateAlignment = () => api.get('/analytics/rate-alignment');
export const fetchProfileDrift = () => api.get('/analytics/profile-drift');
export const fetchGeographic = () => api.get('/analytics/geographic');
export const fetchVerification = () => api.get('/analytics/verification');
export const fetchDriftScore = () => api.get('/analytics/drift-score');
export const fetchLoanStatus = () => api.get('/analytics/loan-status');
export const fetchLoanVolume = () => api.get('/analytics/loan-volume');

// ─── ML / Prediction Endpoints ─────────────────────────────────────

export const fetchFeatureImportance = () => api.get('/prediction/feature-importance');
export const fetchRocCurve = () => api.get('/prediction/roc-curve');
export const fetchConfusionMatrix = () => api.get('/prediction/confusion-matrix');
export const fetchClassificationReport = () => api.get('/prediction/classification-report');
export const fetchTemporalDecay = () => api.get('/prediction/temporal-decay');
export const fetchModelSummary = () => api.get('/prediction/model-summary');
export const fetchPredictionDriftScore = () => api.get('/prediction/drift-score');

export default api;
