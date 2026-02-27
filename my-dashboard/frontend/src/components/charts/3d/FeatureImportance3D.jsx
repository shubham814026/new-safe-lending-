import React, { useRef, useMemo, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

function FeatureBar({ feature, index, total }) {
  const meshRef = useRef();
  const targetHeight = feature.drift_score / 15;

  const color = useMemo(() => {
    const t = feature.drift_score / 80;
    const c = new THREE.Color();
    c.setHSL(0.33 - t * 0.33, 0.8, 0.45);
    return c;
  }, [feature.drift_score]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const currentH = meshRef.current.scale.y;
    const newH = THREE.MathUtils.lerp(currentH, targetHeight, delta * 2);
    meshRef.current.scale.y = newH;
    meshRef.current.position.y = newH / 2;
  });

  const x = (index - total / 2) * 1.4;

  return (
    <group position={[x, 0, 0]}>
      <mesh ref={meshRef}>
        <boxGeometry args={[0.8, 1, 0.8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.15}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
      <Text
        position={[0, targetHeight + 0.5, 0]}
        fontSize={0.2}
        color="#f1f5f9"
        anchorX="center"
      >
        {feature.name}
      </Text>
      <Text
        position={[0, targetHeight + 0.2, 0]}
        fontSize={0.18}
        color={color}
        anchorX="center"
      >
        {feature.drift_score}
      </Text>
    </group>
  );
}

const FeatureImportance3D = memo(function FeatureImportance3D({ features }) {
  const groupRef = useRef();
  const autoRotateRef = useRef(true);

  useFrame((state) => {
    if (!groupRef.current || !autoRotateRef.current) return;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
  });

  if (!features || features.length === 0) return null;

  return (
    <group
      ref={groupRef}
      onClick={() => {
        autoRotateRef.current = !autoRotateRef.current;
      }}
    >
      {features.map((f, i) => (
        <FeatureBar key={f.name} feature={f} index={i} total={features.length} />
      ))}
    </group>
  );
});

export default FeatureImportance3D;
