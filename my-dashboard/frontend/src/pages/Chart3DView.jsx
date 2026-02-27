import React, { useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text, RoundedBox } from '@react-three/drei';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import useDataStore from '../store/useDataStore';
import DashboardLayout from '../components/layout/DashboardLayout';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const pageVariants = {
  initial: { opacity: 0, scale: 1.04 },
  in: { opacity: 1, scale: 1 },
  out: { opacity: 0, scale: 1.04 },
};

/* ─── 3D Feature Importance Bars ─────────────────────────────────── */
function FeatureBars({ features }) {
  const groupRef = useRef();
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.08;
  });

  if (!features?.length) return null;
  const top = features.slice(0, 12);
  const maxImp = Math.max(...top.map((f) => f.importance));
  const radius = 5;

  return (
    <group ref={groupRef}>
      {top.map((f, i) => {
        const angle = (i / top.length) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const height = (f.importance / maxImp) * 6 + 0.5;
        const hue = (i / top.length) * 0.5 + 0.45; // cyan → purple
        const color = new THREE.Color().setHSL(hue, 0.8, 0.55);

        return (
          <group key={i} position={[x, height / 2, z]}>
            <RoundedBox args={[0.6, height, 0.6]} radius={0.08} smoothness={4}>
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} metalness={0.4} roughness={0.3} />
            </RoundedBox>
            <Text
              position={[0, height / 2 + 0.5, 0]}
              fontSize={0.28}
              color="white"
              anchorX="center"
              anchorY="bottom"
            >
              {f.name.length > 12 ? f.name.slice(0, 12) + '…' : f.name}
            </Text>
            <Text
              position={[0, -height / 2 - 0.3, 0]}
              fontSize={0.22}
              color="#94a3b8"
              anchorX="center"
              anchorY="top"
            >
              {f.importance.toFixed(4)}
            </Text>
          </group>
        );
      })}
      {/* Center label */}
      <Text position={[0, 7, 0]} fontSize={0.5} color="#06b6d4" anchorX="center">
        Feature Importance
      </Text>
    </group>
  );
}

/* ─── 3D Grade Default Visualization ──────────────────────────── */
function GradeDefaultSpheres({ driftScore }) {
  const groupRef = useRef();
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.06;
  });

  if (!driftScore?.rows?.length) return null;
  const rows = driftScore.rows;

  return (
    <group ref={groupRef}>
      {rows.map((r, i) => {
        const x = (i - rows.length / 2) * 1.8;
        const y = r.spread / 4;
        const size = 0.3 + r.spread / 15;
        const hue = 0.55 - (r.spread / 30) * 0.55; // green → red
        const color = new THREE.Color().setHSL(Math.max(0, hue), 0.8, 0.5);

        return (
          <group key={i} position={[x, y, 0]}>
            <mesh>
              <sphereGeometry args={[size, 32, 32]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.25} metalness={0.3} roughness={0.4} transparent opacity={0.9} />
            </mesh>
            <Text position={[0, -size - 0.3, 0]} fontSize={0.22} color="#cbd5e1" anchorX="center">
              {r.year}
            </Text>
            <Text position={[0, size + 0.3, 0]} fontSize={0.2} color="#94a3b8" anchorX="center">
              {r.spread.toFixed(1)}%
            </Text>
          </group>
        );
      })}
      <Text position={[0, 5, 0]} fontSize={0.45} color="#a855f7" anchorX="center">
        Grade Spread by Year
      </Text>
    </group>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────── */
export default function Chart3DView() {
  const navigate = useNavigate();
  const { predictionData, fetchAllPredictions, analyticsData, fetchAllAnalytics, selectedChart, setSelectedChart } = useDataStore();

  useEffect(() => {
    if (!predictionData.featureImportance) fetchAllPredictions();
    if (!analyticsData.driftScore) fetchAllAnalytics();
  }, []);

  const features = predictionData.featureImportance?.features;
  const driftScore = analyticsData.driftScore;

  const tabs = [
    { id: 'features', label: 'Feature Importance 3D' },
    { id: 'drift', label: 'Grade Spread 3D' },
  ];
  const active = ['features', 'drift'].includes(selectedChart) ? selectedChart : 'features';

  return (
    <DashboardLayout hideSidebar>
      <motion.div
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        className="relative h-full"
      >
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 z-20 flex items-center gap-2 px-4 py-2 
                     rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300
                     hover:bg-white/10 transition-colors backdrop-blur-md"
        >
          ← Back to Dashboard
        </button>

        {/* Tabs */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedChart(tab.id)}
              className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                active === tab.id
                  ? 'bg-accent-cyan/20 text-accent-cyan shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 3D Canvas */}
        <div className="w-full h-[calc(100vh-8rem)] rounded-2xl overflow-hidden border border-white/10">
          <Suspense fallback={<div className="flex items-center justify-center h-full"><LoadingSpinner size={60} /></div>}>
            <Canvas
              camera={{ position: [10, 8, 10], fov: 50 }}
              style={{ background: '#000000' }}
              gl={{ antialias: true }}
            >
              <ambientLight intensity={0.3} />
              <pointLight position={[10, 10, 10]} color="#06b6d4" intensity={1} />
              <pointLight position={[-10, -10, 5]} color="#8b5cf6" intensity={0.5} />

              <Stars radius={50} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />

              <OrbitControls enablePan enableZoom enableRotate autoRotate autoRotateSpeed={0.4} minDistance={3} maxDistance={30} />

              {active === 'features' && features && <FeatureBars features={features} />}
              {active === 'drift' && driftScore && <GradeDefaultSpheres driftScore={driftScore} />}
            </Canvas>
          </Suspense>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
