import { create } from 'zustand';
import {
  fetchStats,
  fetchGradeDrift,
  fetchRateAlignment,
  fetchProfileDrift,
  fetchGeographic,
  fetchVerification,
  fetchDriftScore,
  fetchLoanStatus,
  fetchLoanVolume,
  fetchFeatureImportance,
  fetchRocCurve,
  fetchConfusionMatrix,
  fetchClassificationReport,
  fetchTemporalDecay,
  fetchModelSummary,
} from '../api';

const useDataStore = create((set, get) => ({
  // ─── Analytics data (Dashboard page) ────────────────────────────
  analyticsData: {
    stats: null,
    gradeDrift: null,
    rateAlignment: null,
    profileDrift: null,
    geographic: null,
    verification: null,
    driftScore: null,
    loanStatus: null,
    loanVolume: null,
  },

  // ─── ML / Prediction data (Prediction page) ────────────────────
  predictionData: {
    featureImportance: null,
    rocCurve: null,
    confusionMatrix: null,
    classificationReport: null,
    temporalDecay: null,
    modelSummary: null,
  },

  // ─── UI state ────────────────────────────────────────────────────
  selectedChart: 'scatter',
  isLoading: false,
  isPredictionLoading: false,
  lastUpdated: null,

  // ─── Actions ────────────────────────────────────────────────────

  fetchAllAnalytics: async () => {
    set({ isLoading: true });
    try {
      const [stats, gradeDrift, rateAlignment, profileDrift, geographic, verification, driftScore, loanStatus, loanVolume] =
        await Promise.all([
          fetchStats(),
          fetchGradeDrift(),
          fetchRateAlignment(),
          fetchProfileDrift(),
          fetchGeographic(),
          fetchVerification(),
          fetchDriftScore(),
          fetchLoanStatus(),
          fetchLoanVolume(),
        ]);
      set({
        analyticsData: {
          stats: stats.data,
          gradeDrift: gradeDrift.data,
          rateAlignment: rateAlignment.data,
          profileDrift: profileDrift.data,
          geographic: geographic.data,
          verification: verification.data,
          driftScore: driftScore.data,
          loanStatus: loanStatus.data,
          loanVolume: loanVolume.data,
        },
        lastUpdated: new Date().toISOString(),
        isLoading: false,
      });
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      set({ isLoading: false });
    }
  },

  fetchAllPredictions: async () => {
    set({ isPredictionLoading: true });
    try {
      const [featureImportance, rocCurve, confusionMatrix, classificationReport, temporalDecay, modelSummary] =
        await Promise.all([
          fetchFeatureImportance(),
          fetchRocCurve(),
          fetchConfusionMatrix(),
          fetchClassificationReport(),
          fetchTemporalDecay(),
          fetchModelSummary(),
        ]);
      set({
        predictionData: {
          featureImportance: featureImportance.data,
          rocCurve: rocCurve.data,
          confusionMatrix: confusionMatrix.data,
          classificationReport: classificationReport.data,
          temporalDecay: temporalDecay.data,
          modelSummary: modelSummary.data,
        },
        lastUpdated: new Date().toISOString(),
        isPredictionLoading: false,
      });
    } catch (err) {
      console.error('Failed to fetch predictions:', err);
      set({ isPredictionLoading: false });
    }
  },

  setSelectedChart: (chartType) => set({ selectedChart: chartType }),

  refreshAll: async () => {
    const { fetchAllAnalytics, fetchAllPredictions } = get();
    await Promise.all([fetchAllAnalytics(), fetchAllPredictions()]);
  },
}));

export default useDataStore;
