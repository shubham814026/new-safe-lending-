import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Dashboard from './pages/Dashboard';
import LoadingSpinner from './components/ui/LoadingSpinner';

const Chart3DView = lazy(() => import('./pages/Chart3DView'));
const Prediction = lazy(() => import('./pages/Prediction'));

function FullPageLoader() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#0f172a]">
      <LoadingSpinner size={60} />
    </div>
  );
}

export default function App() {
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<FullPageLoader />}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/3d-view" element={<Chart3DView />} />
          <Route path="/predictions" element={<Prediction />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}
