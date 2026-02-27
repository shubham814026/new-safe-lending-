import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatCard from '../components/ui/StatCard';
import ChartCard from '../components/ui/ChartCard';
import GradeDriftChart from '../components/charts/lending/GradeDriftChart';
import RateAlignmentChart from '../components/charts/lending/RateAlignmentChart';
import ProfileDriftChart from '../components/charts/lending/ProfileDriftChart';
import GeographicChart from '../components/charts/lending/GeographicChart';
import VerificationChart from '../components/charts/lending/VerificationChart';
import DriftScoreChart from '../components/charts/lending/DriftScoreChart';
import LoanVolumeChart from '../components/charts/lending/LoanVolumeChart';
import LoanStatusChart from '../components/charts/lending/LoanStatusChart';
import useDataStore from '../store/useDataStore';

const pageVariants = {
  initial: { opacity: 0, scale: 0.96 },
  in: { opacity: 1, scale: 1 },
  out: { opacity: 0, scale: 0.96 },
};

export default function Dashboard() {
  const { analyticsData, isLoading, fetchAllAnalytics } = useDataStore();
  const {
    stats,
    gradeDrift,
    rateAlignment,
    profileDrift,
    geographic,
    verification,
    driftScore,
    loanStatus,
    loanVolume,
  } = analyticsData;

  useEffect(() => {
    if (!stats) fetchAllAnalytics();
  }, []);

  return (
    <DashboardLayout>
      <motion.div
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
      >
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-accent-cyan via-accent-purple to-accent-cyan bg-[length:200%_auto] animate-gradient-x bg-clip-text text-transparent">
            Lending Club Analytics Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Real data from 2.26M+ loans — Grade drift, risk analysis &amp; model insights
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats
            ? stats.map((s, i) => <StatCard key={i} {...s} />)
            : Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-28 rounded-2xl border border-white/10 skeleton-shimmer"
                  style={{ background: 'rgba(15,23,42,0.6)' }}
                />
              ))}
        </div>

        {/* Row 1: Grade Drift + Rate Alignment */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">
          <div className="lg:col-span-3">
            <ChartCard
              title="Grade Drift Analysis"
              subtitle="Default rate by loan grade (A–G) across years — maturity-filtered"
              chartType="grade-drift"
              loading={isLoading && !gradeDrift}
              show3DButton={false}
            >
              <GradeDriftChart data={gradeDrift} />
            </ChartCard>
          </div>
          <div className="lg:col-span-2">
            <ChartCard
              title="Rate vs Default Alignment"
              subtitle="Interest rate vs actual default rate per grade"
              chartType="rate-alignment"
              loading={isLoading && !rateAlignment}
              show3DButton={false}
            >
              <RateAlignmentChart data={rateAlignment} />
            </ChartCard>
          </div>
        </div>

        {/* Row 2: Profile Drift DTI + Delinquency */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <ChartCard
            title="DTI Drift by Grade"
            subtitle="Debt-to-Income ratio evolution across years"
            chartType="profile-drift-dti"
            loading={isLoading && !profileDrift}
            show3DButton={false}
          >
            <ProfileDriftChart data={profileDrift} metric="dti" />
          </ChartCard>
          <ChartCard
            title="Delinquency Drift by Grade"
            subtitle="Past delinquency rate trends across years"
            chartType="profile-drift-delinq"
            loading={isLoading && !profileDrift}
            show3DButton={false}
          >
            <ProfileDriftChart data={profileDrift} metric="delinq" />
          </ChartCard>
        </div>

        {/* Row 3: Geographic Risk + Verification Paradox */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">
          <div className="lg:col-span-3">
            <ChartCard
              title="Geographic Risk — Grade C"
              subtitle="State-level default rates for Grade C loans (top 30)"
              chartType="geographic"
              loading={isLoading && !geographic}
              show3DButton={false}
            >
              <GeographicChart data={geographic} />
            </ChartCard>
          </div>
          <div className="lg:col-span-2">
            <ChartCard
              title="Verification Paradox"
              subtitle="Default rate by verification status per grade"
              chartType="verification"
              loading={isLoading && !verification}
              show3DButton={false}
            >
              <VerificationChart data={verification} />
            </ChartCard>
          </div>
        </div>

        {/* Row 4: Drift Score + Loan Volume */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <ChartCard
            title="Grade Spread Drift Score"
            subtitle="Gap between Grade A and Grade G default rates over time"
            chartType="drift-score"
            loading={isLoading && !driftScore}
            show3DButton={false}
          >
            <DriftScoreChart data={driftScore} />
          </ChartCard>
          <ChartCard
            title="Loan Volume Over Time"
            subtitle="Loan count & total funded amount per year"
            chartType="loan-volume"
            loading={isLoading && !loanVolume}
            show3DButton={false}
          >
            <LoanVolumeChart data={loanVolume} />
          </ChartCard>
        </div>

        {/* Row 5: Loan Status Distribution */}
        <div className="mb-4">
          <ChartCard
            title="Loan Status Distribution"
            subtitle="Current status breakdown across all loans"
            chartType="loan-status"
            loading={isLoading && !loanStatus}
            show3DButton={false}
          >
            <LoanStatusChart data={loanStatus} />
          </ChartCard>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
