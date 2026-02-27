import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useDataStore from '../../store/useDataStore';

const ChartCard = memo(function ChartCard({
  title,
  subtitle,
  chartType,
  loading,
  error,
  onRetry,
  children,
  className = '',
  show3DButton = true,
}) {
  const navigate = useNavigate();
  const setSelectedChart = useDataStore((s) => s.setSelectedChart);

  const handleView3D = () => {
    setSelectedChart(chartType);
    navigate('/3d-view');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative overflow-hidden rounded-2xl border ${
        error ? 'border-accent-red/40' : 'border-white/10'
      } ${className}`}
      style={{
        background: 'rgba(15,23,42,0.6)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between px-5 pt-4 pb-2">
        <div>
          <h3 className="text-base font-semibold text-slate-100">{title}</h3>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
          )}
        </div>
        {show3DButton && (
          <button
            onClick={handleView3D}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
                       bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20
                       hover:bg-accent-cyan/20 transition-all duration-200
                       shadow-[0_0_12px_rgba(6,182,212,0.15)]
                       hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]"
          >
            View in 3D 🔮
          </button>
        )}
      </div>

      {/* Body */}
      <div className="px-5 pb-5 min-h-[260px] flex items-center justify-center">
        {loading ? (
          <SkeletonLoader />
        ) : error ? (
          <ErrorState message={error} onRetry={onRetry} />
        ) : (
          <div className="w-full h-full">{children}</div>
        )}
      </div>
    </motion.div>
  );
});

function SkeletonLoader() {
  return (
    <div className="w-full h-[240px] rounded-xl overflow-hidden relative bg-white/5">
      <div className="absolute inset-0 skeleton-shimmer" />
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <svg
        width="40"
        height="40"
        fill="none"
        viewBox="0 0 24 24"
        stroke="#ef4444"
        strokeWidth={1.5}
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
      <p className="text-sm text-slate-400">{message || 'Failed to load data'}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-1.5 text-xs rounded-lg bg-accent-red/10 text-accent-red
                     border border-accent-red/20 hover:bg-accent-red/20 transition"
        >
          Retry
        </button>
      )}
    </div>
  );
}

export default ChartCard;
