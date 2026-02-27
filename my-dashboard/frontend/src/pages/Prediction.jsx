import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/layout/DashboardLayout';
import ChartCard from '../components/ui/ChartCard';
import FeatureImportanceChart from '../components/charts/lending/FeatureImportanceChart';
import RocCurveChart from '../components/charts/lending/RocCurveChart';
import ConfusionMatrixChart from '../components/charts/lending/ConfusionMatrixChart';
import TemporalDecayChart from '../components/charts/lending/TemporalDecayChart';
import DriftScoreChart from '../components/charts/lending/DriftScoreChart';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import useDataStore from '../store/useDataStore';

const pageVariants = {
  initial: { opacity: 0, scale: 0.96 },
  in: { opacity: 1, scale: 1 },
  out: { opacity: 0, scale: 0.96 },
};

function MetricBadge({ label, value, color = '#06b6d4' }) {
  return (
    <div className="text-center p-3 rounded-xl bg-white/5 border border-white/5">
      <p className="text-xl font-bold" style={{ color }}>
        {value}
      </p>
      <p className="text-[10px] text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

export default function Prediction() {
  const { predictionData, isPredictionLoading, fetchAllPredictions, analyticsData, fetchAllAnalytics } = useDataStore();
  const {
    featureImportance,
    rocCurve,
    confusionMatrix,
    classificationReport,
    temporalDecay,
    modelSummary,
  } = predictionData;
  const { driftScore } = analyticsData;

  useEffect(() => {
    if (!featureImportance) fetchAllPredictions();
    if (!driftScore) fetchAllAnalytics();
  }, []);

  const report = classificationReport || {};

  return (
    <DashboardLayout>
      <motion.div
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
      >
        {/* Hero Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-accent-cyan via-accent-purple to-accent-cyan bg-[length:200%_auto] animate-gradient-x bg-clip-text text-transparent">
            ML Model — Default Prediction
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Random Forest trained on application-only features — no data leakage
          </p>
        </div>

        {/* Model Summary Cards */}
        {modelSummary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <MetricBadge label="Model" value={modelSummary.model_name || 'RandomForest'} color="#a855f7" />
            <MetricBadge label="AUC Score" value={modelSummary.auc?.toFixed(4) || '—'} color="#06b6d4" />
            <MetricBadge label="Features Used" value={modelSummary.n_features || '—'} color="#10b981" />
            <MetricBadge label="Train Samples" value={(modelSummary.train_samples || 0).toLocaleString()} color="#f59e0b" />
          </div>
        )}

        {/* Row 1: ROC Curve + Confusion Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">
          <div className="lg:col-span-3">
            <ChartCard
              title="ROC Curve"
              subtitle="Receiver Operating Characteristic — model discrimination"
              chartType="roc"
              loading={isPredictionLoading && !rocCurve}
              show3DButton={false}
            >
              <RocCurveChart data={rocCurve} />
            </ChartCard>
          </div>
          <div className="lg:col-span-2">
            <ChartCard
              title="Confusion Matrix"
              subtitle="Predicted vs actual default classification"
              chartType="confusion"
              loading={isPredictionLoading && !confusionMatrix}
              show3DButton={false}
            >
              <ConfusionMatrixChart data={confusionMatrix} />
            </ChartCard>
          </div>
        </div>

        {/* Row 2: Feature Importance */}
        <div className="mb-4">
          <ChartCard
            title="Feature Importance (Top 15)"
            subtitle="Random Forest feature importance — application-only predictors"
            chartType="feature-importance"
            loading={isPredictionLoading && !featureImportance}
            show3DButton={false}
          >
            <FeatureImportanceChart data={featureImportance} />
          </ChartCard>
        </div>

        {/* Row 3: Temporal Decay + Classification Report */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">
          <div className="lg:col-span-3">
            <ChartCard
              title="Temporal Decay Analysis"
              subtitle="Train 2009-2011, test each future year — AUC degradation & default-rate shift"
              chartType="temporal-decay"
              loading={isPredictionLoading && !temporalDecay}
              show3DButton={false}
            >
              <TemporalDecayChart data={temporalDecay} />
            </ChartCard>
          </div>
          <div className="lg:col-span-2">
            <div
              className="rounded-2xl border border-white/10 p-5 h-full"
              style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(12px)' }}
            >
              <h3 className="text-base font-semibold text-slate-100 mb-1">
                Classification Report
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Per-class precision, recall &amp; F1 score
              </p>
              {isPredictionLoading && !classificationReport ? (
                <div className="h-[200px] flex items-center justify-center">
                  <LoadingSpinner />
                </div>
              ) : report.rows ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-2 text-slate-400 font-medium">Class</th>
                        <th className="text-right py-2 text-slate-400 font-medium">Precision</th>
                        <th className="text-right py-2 text-slate-400 font-medium">Recall</th>
                        <th className="text-right py-2 text-slate-400 font-medium">F1</th>
                        <th className="text-right py-2 text-slate-400 font-medium">Support</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.rows.map((r, i) => (
                        <tr key={i} className="border-b border-white/5">
                          <td className="py-2 text-slate-200 font-medium">{r.label}</td>
                          <td className="py-2 text-right text-cyan-400">{r.precision?.toFixed(3)}</td>
                          <td className="py-2 text-right text-purple-400">{r.recall?.toFixed(3)}</td>
                          <td className="py-2 text-right text-emerald-400">{r.f1?.toFixed(3)}</td>
                          <td className="py-2 text-right text-slate-400">{r.support?.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {report.accuracy != null && (
                    <div className="mt-3 pt-3 border-t border-white/10 flex justify-between text-sm">
                      <span className="text-slate-400">Overall Accuracy</span>
                      <span className="text-accent-cyan font-bold">{(report.accuracy * 100).toFixed(2)}%</span>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Row 4: Drift Score */}
        <div className="mb-4">
          <ChartCard
            title="Grade Spread Drift Score"
            subtitle="Risk differentiation gap over time — higher = better grade separation"
            chartType="drift-score"
            loading={!driftScore}
            show3DButton={false}
          >
            <DriftScoreChart data={driftScore} />
          </ChartCard>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
