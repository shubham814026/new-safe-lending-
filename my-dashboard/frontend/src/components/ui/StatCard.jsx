import React, { useEffect, useState, memo } from 'react';
import { motion } from 'framer-motion';

const icons = {
  database: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <ellipse cx="12" cy="6" rx="8" ry="3" />
      <path d="M4 6v6c0 1.657 3.582 3 8 3s8-1.343 8-3V6" />
      <path d="M4 12v6c0 1.657 3.582 3 8 3s8-1.343 8-3v-6" />
    </svg>
  ),
  target: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  activity: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  shield: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
};

function AnimatedNumber({ value, suffix = '', duration = 1500 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    const startTime = performance.now();
    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(start + (end - start) * eased);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value, duration]);

  const formatted =
    value >= 1000
      ? Math.round(display).toLocaleString()
      : display.toFixed(1);

  return (
    <span>
      {formatted}
      {suffix}
    </span>
  );
}

const StatCard = memo(function StatCard({ title, value, suffix, change, trend, icon, color }) {
  const isUp = trend === 'up';
  const changeColor = isUp ? 'text-accent-green' : 'text-accent-red';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl border border-white/10 p-5"
      style={{
        background: 'rgba(15,23,42,0.6)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Subtle gradient accent */}
      <div
        className="absolute top-0 right-0 h-24 w-24 rounded-full opacity-15 blur-2xl"
        style={{ background: color }}
      />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400 mb-1">{title}</p>
          <p className="text-3xl font-bold tracking-tight" style={{ color }}>
            <AnimatedNumber value={value} suffix={suffix || ''} />
          </p>
        </div>
        <div
          className="flex items-center justify-center w-10 h-10 rounded-xl"
          style={{ background: `${color}22`, color }}
        >
          {icons[icon] || icons.activity}
        </div>
      </div>

      <div className={`mt-3 flex items-center gap-1 text-sm ${changeColor}`}>
        <span>{isUp ? '↑' : '↓'}</span>
        <span>{Math.abs(change)}%</span>
        <span className="text-slate-500 ml-1">vs last period</span>
      </div>
    </motion.div>
  );
});

export default StatCard;
