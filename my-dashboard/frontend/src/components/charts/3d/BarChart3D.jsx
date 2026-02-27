import React, { useRef, useMemo, useState, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Grid } from '@react-three/drei';
import * as THREE from 'three';

const barColors = ['#06b6d4', '#8b5cf6', '#10b981'];

function Bar3D({ x, z, height, color, label, groupIdx, catIdx }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [animatedH, setAnimatedH] = useState(0);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const target = height / 20;
    const newH = THREE.MathUtils.lerp(animatedH, target, delta * 3);
    setAnimatedH(newH);
    meshRef.current.position.y = newH / 2;
    meshRef.current.scale.y = Math.max(0.001, newH);
  });

  const threeColor = useMemo(() => new THREE.Color(color), [color]);

  return (
    <group position={[x, 0, z]}>
      <mesh
        ref={meshRef}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[0.6, 1, 0.6]} />
        <meshStandardMaterial
          color={threeColor}
          emissive={threeColor}
          emissiveIntensity={hovered ? 0.5 : 0.1}
          metalness={0.2}
          roughness={0.4}
        />
      </mesh>
      {label && groupIdx === 0 && (
        <Text
          position={[0.3, -0.3, 0]}
          fontSize={0.2}
          color="#94a3b8"
          anchorX="center"
          rotation={[-Math.PI / 2, 0, 0]}
        >
          {label}
        </Text>
      )}
    </group>
  );
}

const BarChart3D = memo(function BarChart3D({ data }) {
  if (!data) return null;

  const bars = useMemo(() => {
    const result = [];
    data.data.forEach((item, catIdx) => {
      data.groups.forEach((group, groupIdx) => {
        result.push({
          x: catIdx * 2.5 - (data.data.length * 2.5) / 2 + groupIdx * 0.7,
          z: groupIdx * 0.8 - 0.8,
          height: item[group],
          color: barColors[groupIdx % barColors.length],
          label: item.category,
          groupIdx,
          catIdx,
        });
      });
    });
    return result;
  }, [data]);

  return (
    <group>
      <Grid
        position={[0, -0.01, 0]}
        args={[30, 30]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#1e293b"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#334155"
        fadeDistance={30}
        infiniteGrid
      />

      {bars.map((bar, i) => (
        <Bar3D key={i} {...bar} />
      ))}

      {/* Legend */}
      {data.groups.map((g, i) => (
        <Text
          key={g}
          position={[8, 3 - i * 0.5, 0]}
          fontSize={0.25}
          color={barColors[i]}
          anchorX="left"
        >
          ● {g}
        </Text>
      ))}
    </group>
  );
});

export default BarChart3D;
