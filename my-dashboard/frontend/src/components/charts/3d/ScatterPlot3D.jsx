import React, { useRef, useMemo, useState, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

const clusterColors = {
  'Cluster A': '#06b6d4',
  'Cluster B': '#8b5cf6',
  'Cluster C': '#10b981',
  'Cluster D': '#f59e0b',
};

function DataSphere({ point, index }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  const position = useMemo(() => {
    const x = (point.x - 50) / 10;
    const y = (point.y - 50) / 10;
    const z = (point.size - 9) / 3;
    return [x, y, z];
  }, [point]);

  const color = useMemo(() => new THREE.Color(point.color || clusterColors[point.cluster] || '#06b6d4'), [point]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const target = hovered ? 1.5 : 1;
    meshRef.current.scale.lerp(new THREE.Vector3(target, target, target), delta * 8);
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshStandardMaterial
        color={color}
        metalness={0.3}
        roughness={0.2}
        emissive={color}
        emissiveIntensity={hovered ? 0.6 : 0.1}
      />
      {hovered && (
        <pointLight color={color} intensity={0.5} distance={2} />
      )}
    </mesh>
  );
}

function Axis({ start, end, color = '#94a3b8' }) {
  const dir = new THREE.Vector3(...end).sub(new THREE.Vector3(...start));
  const len = dir.length();
  const mid = new THREE.Vector3(...start).add(dir.multiplyScalar(0.5));

  return (
    <mesh position={[mid.x, mid.y, mid.z]}>
      <cylinderGeometry args={[0.02, 0.02, len, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.3} />
    </mesh>
  );
}

const ScatterPlot3D = memo(function ScatterPlot3D({ data }) {
  const points = data?.points || [];

  return (
    <group>
      {/* Axes */}
      <Axis start={[-5, 0, 0]} end={[5, 0, 0]} color="#ef4444" />
      <Axis start={[0, -5, 0]} end={[0, 5, 0]} color="#10b981" />
      <Axis start={[0, 0, -3]} end={[0, 0, 3]} color="#06b6d4" />

      {/* Axis Labels */}
      <Text position={[5.5, 0, 0]} fontSize={0.3} color="#ef4444">X</Text>
      <Text position={[0, 5.5, 0]} fontSize={0.3} color="#10b981">Y</Text>
      <Text position={[0, 0, 3.5]} fontSize={0.3} color="#06b6d4">Z</Text>

      {/* Data Points */}
      {points.map((pt, i) => (
        <DataSphere key={pt.id ?? i} point={pt} index={i} />
      ))}
    </group>
  );
});

export default ScatterPlot3D;
