import React, { memo } from 'react';
import { motion } from 'framer-motion';

const severityConfig = {
  critical: {
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.3)',
    icon: (
      <svg width="16" height="16" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  warning: {
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.3)',
    icon: (
      <svg width="16" height="16" fill="none" stroke="#f59e0b" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
  info: {
    color: '#06b6d4',
    bg: 'rgba(6,182,212,0.08)',
    border: 'rgba(6,182,212,0.3)',
    icon: (
      <svg width="16" height="16" fill="none" stroke="#06b6d4" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  },
};

const AlertPanel = memo(function AlertPanel({ alerts }) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
      {alerts.map((alert, i) => {
        const config = severityConfig[alert.severity] || severityConfig.info;
        const isCritical = alert.severity === 'critical';

        return (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: i * 0.12 }}
            className={`relative rounded-xl p-4 border-l-4 ${isCritical ? 'animate-pulse-subtle' : ''}`}
            style={{
              background: config.bg,
              borderLeftColor: config.color,
              border: `1px solid ${config.border}`,
              borderLeftWidth: '4px',
            }}
          >
            {/* Critical glow */}
            {isCritical && (
              <div
                className="absolute inset-0 rounded-xl opacity-20 blur-xl pointer-events-none"
                style={{ background: config.color }}
              />
            )}

            <div className="flex items-start gap-3 relative z-10">
              <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full tracking-wider"
                    style={{
                      color: config.color,
                      background: `${config.color}20`,
                    }}
                  >
                    {alert.severity}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(alert.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {alert.message}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
});

export default AlertPanel;
