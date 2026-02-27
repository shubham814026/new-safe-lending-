import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = memo(function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [dataset, setDataset] = useState('Dataset A');

  return (
    <AnimatePresence initial={false}>
      <motion.aside
        animate={{ width: collapsed ? 64 : 280 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="relative flex-shrink-0 h-full border-r border-white/10 overflow-hidden"
        style={{
          background: 'rgba(15,23,42,0.5)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-0 top-4 z-10 w-6 h-6 flex items-center justify-center
                     rounded-full bg-navy-800 border border-white/10 text-slate-400
                     hover:text-white transition-colors text-xs"
        >
          {collapsed ? '→' : '←'}
        </button>

        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-5 space-y-6 pt-12"
          >
            {/* Dataset Selector */}
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Dataset
              </label>
              <select
                value={dataset}
                onChange={(e) => setDataset(e.target.value)}
                className="mt-2 w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10
                           text-slate-200 focus:outline-none focus:border-accent-cyan/40"
              >
                <option value="Dataset A">Dataset A</option>
                <option value="Dataset B">Dataset B</option>
                <option value="Dataset C">Dataset C</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Date Range
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  defaultValue="Jan 1, 2026"
                  readOnly
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white/5 border border-white/10
                             text-slate-300"
                />
                <input
                  type="text"
                  defaultValue="Feb 27, 2026"
                  readOnly
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white/5 border border-white/10
                             text-slate-300"
                />
              </div>
            </div>

            {/* Model Info */}
            <div
              className="rounded-xl p-4 border border-white/10"
              style={{ background: 'rgba(15,23,42,0.8)' }}
            >
              <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
                Model Info
              </h4>
              <p className="text-sm font-semibold text-slate-100">XGBoost v2.1</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-accent-green/10 text-accent-green border border-accent-green/20">
                  Deployed
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">Last trained: 14 days ago</p>

              {/* Performance bar */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Performance</span>
                  <span>78%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '78%' }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-accent-cyan to-accent-purple"
                  />
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Features', value: '42' },
                { label: 'Samples', value: '124K' },
                { label: 'Epochs', value: '250' },
              ].map((s) => (
                <div
                  key={s.label}
                  className="text-center p-2 rounded-lg border border-white/5"
                  style={{ background: 'rgba(15,23,42,0.8)' }}
                >
                  <p className="text-base font-bold text-slate-200">{s.value}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.aside>
    </AnimatePresence>
  );
});

export default Sidebar;
