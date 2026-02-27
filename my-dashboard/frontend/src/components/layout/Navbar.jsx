import React, { memo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import useDataStore from '../../store/useDataStore';

const navLinks = [
  { to: '/', label: 'Dashboard' },
  { to: '/3d-view', label: '3D View' },
  { to: '/predictions', label: 'Predictions' },
];

const Navbar = memo(function Navbar() {
  const { isLoading, lastUpdated, refreshAll } = useDataStore();
  const location = useLocation();

  const handleRefresh = () => {
    refreshAll();
  };

  const formattedTime = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString()
    : '--:--:--';

  return (
    <nav
      className="sticky top-0 z-50 flex items-center justify-between h-16 px-6 border-b border-white/10"
      style={{
        background: 'rgba(15,23,42,0.85)',
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* Left — Logo */}
      <div className="flex items-center gap-3">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path
            d="M4 20 C8 10, 12 26, 16 16 C20 6, 24 22, 28 12"
            stroke="url(#logoGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <defs>
            <linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="0">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>
        <span className="text-lg font-bold bg-gradient-to-r from-accent-cyan to-accent-purple bg-clip-text text-transparent">
          DataSphere
        </span>
      </div>

      {/* Center — Nav links */}
      <div className="flex items-center gap-1">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className="relative px-4 py-2 text-sm font-medium transition-colors duration-200"
              style={{ color: isActive ? '#06b6d4' : '#94a3b8' }}
            >
              {link.label}
              {isActive && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-accent-cyan"
                  style={{
                    boxShadow: '0 0 8px rgba(6,182,212,0.6)',
                  }}
                />
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Right — Status */}
      <div className="flex items-center gap-4">
        <span className="text-xs text-slate-500 hidden md:block">
          Last updated: {formattedTime}
        </span>

        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          title="Refresh data"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="2"
            strokeLinecap="round"
            className={isLoading ? 'animate-spin' : ''}
          >
            <path d="M21 2v6h-6" />
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
            <path d="M3 22v-6h6" />
            <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
          </svg>
        </button>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-green/10 border border-accent-green/20">
          <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
          <span className="text-xs font-medium text-accent-green">LIVE</span>
        </div>
      </div>
    </nav>
  );
});

export default Navbar;
