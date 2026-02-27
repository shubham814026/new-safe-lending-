import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float } from '@react-three/drei';
import * as THREE from 'three';

/* ------------------------------------------------------------------ */
/*  Generates a wavy surface coloured by height (purple → cyan → red) */
/*  Represents the confidence envelope of a drift prediction surface  */
/* ------------------------------------------------------------------ */

function Surface({ data, wireframe = false }) {
  const meshRef = useRef();
  const clock = useRef(0);

  const { geometry, colors } = useMemo(() => {
    const rows = data?.length || 20;
    const cols = data?.[0]?.length || 20;
    const size = 6;
    const geo = new THREE.PlaneGeometry(size, size, cols - 1, rows - 1);
    const positions = geo.attributes.position;
    const colorArr = new Float32Array(positions.count * 3);

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const idx = i * cols + j;
        const x = positions.getX(idx);
        const z = positions.getY(idx);
        // Generate height from data or procedurally
        let h;
        if (data && data[i] && data[i][j] !== undefined) {
          h = data[i][j];
        } else {
          h = Math.sin(x * 1.5) * Math.cos(z * 1.2) * 0.8 +
              Math.sin(x * 0.5 + z * 0.7) * 0.4;
        }
        positions.setZ(idx, h);

        // Color map: low → purple, mid → cyan, high → red
        const t = (h + 1.2) / 2.4; // normalise -1.2 .. 1.2 → 0..1
        const c = new THREE.Color();
        if (t < 0.5) {
          c.lerpColors(new THREE.Color('#8b5cf6'), new THREE.Color('#06b6d4'), t * 2);
        } else {
          c.lerpColors(new THREE.Color('#06b6d4'), new THREE.Color('#ef4444'), (t - 0.5) * 2);
        }
        colorArr[idx * 3] = c.r;
        colorArr[idx * 3 + 1] = c.g;
        colorArr[idx * 3 + 2] = c.b;
      }
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colorArr, 3));
    geo.computeVertexNormals();
    return { geometry: geo, colors: colorArr };
  }, [data]);

  // Gentle wave animation
  useFrame((_, delta) => {
    if (!meshRef.current) return;
    clock.current += delta * 0.4;
    const positions = meshRef.current.geometry.attributes.position;
    const rows = data?.length || 20;
    const cols = data?.[0]?.length || 20;

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const idx = i * cols + j;
        const x = positions.getX(idx);
        const y = positions.getY(idx);
        let base;
        if (data && data[i] && data[i][j] !== undefined) {
          base = data[i][j];
        } else {
          base = Math.sin(x * 1.5) * Math.cos(y * 1.2) * 0.8 +
                 Math.sin(x * 0.5 + y * 0.7) * 0.4;
        }
        positions.setZ(idx, base + Math.sin(clock.current + x + y) * 0.06);
      }
    }
    positions.needsUpdate = true;
  });

  return (
    <mesh ref={meshRef} geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <meshStandardMaterial
        vertexColors
        side={THREE.DoubleSide}
        wireframe={wireframe}
        transparent
        opacity={wireframe ? 0.6 : 0.85}
        roughness={0.4}
        metalness={0.2}
      />
    </mesh>
  );
}

/* Axis labels */
function AxisLabels() {
  const common = { fontSize: 0.25, color: '#94a3b8', anchorX: 'center', anchorY: 'middle' };
  return (
    <>
      <Text position={[0, -1.2, 3.5]} {...common}>Time →</Text>
      <Text position={[-3.5, -1.2, 0]} rotation={[0, Math.PI / 2, 0]} {...common}>Features →</Text>
      <Text position={[-3.5, 0.8, -3.5]} {...common}>Confidence ↑</Text>
    </>
  );
}

/* Grid floor */
function GridFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]}>
      <planeGeometry args={[8, 8]} />
      <meshStandardMaterial color="#0f172a" transparent opacity={0.5} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/*  Main exported component                                           */
/* ------------------------------------------------------------------ */

export default function PredictionConfidenceSurface({ data }) {
  // Build a 20×20 grid from prediction data (or use procedural fallback)
  const surfaceData = useMemo(() => {
    if (!data || !data.dates) return null;

    const rows = 20;
    const cols = 20;
    const grid = [];

    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < cols; j++) {
        // Map i to feature axis, j to time axis
        const timeIdx = Math.floor((j / cols) * (data.dates?.length || 1));
        const baseScore = data.scores?.[timeIdx] ?? 0.5;
        const upper = data.upper?.[timeIdx] ?? baseScore + 0.1;
        const lower = data.lower?.[timeIdx] ?? baseScore - 0.1;
        const range = upper - lower;

        // Create a surface that rises towards drift regions
        const featureFactor = Math.sin((i / rows) * Math.PI) * 0.6;
        const h = (baseScore - 0.5) * 2 + featureFactor * range * 3;
        row.push(h);
      }
      grid.push(row);
    }
    return grid;
  }, [data]);

  return (
    <div className="w-full h-full min-h-[320px]">
      <Canvas camera={{ position: [5, 4, 5], fov: 50 }} dpr={[1, 2]}>
        <color attach="background" args={['#0f172a']} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 8, 5]} intensity={0.8} />
        <pointLight position={[-3, 3, -3]} color="#8b5cf6" intensity={0.5} />
        <pointLight position={[3, 3, 3]} color="#06b6d4" intensity={0.5} />

        <Surface data={surfaceData} />
        <Surface data={surfaceData} wireframe />
        <AxisLabels />
        <GridFloor />

        <Float speed={1.5} floatIntensity={0.3}>
          <Text position={[0, 2.2, 0]} fontSize={0.3} color="#06b6d4" anchorX="center">
            Prediction Confidence Surface
          </Text>
        </Float>

        <OrbitControls
          enableDamping
          dampingFactor={0.08}
          minDistance={3}
          maxDistance={14}
          autoRotate
          autoRotateSpeed={0.6}
        />
      </Canvas>
    </div>
  );
}
