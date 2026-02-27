import React, { useRef, useMemo, useState, memo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const SurfacePlot3D = memo(function SurfacePlot3D({ data }) {
  const meshRef = useRef();
  const [wireframe, setWireframe] = useState(false);
  const [morphProgress, setMorphProgress] = useState(0);

  useFrame((_, delta) => {
    if (morphProgress < 1) {
      setMorphProgress((p) => Math.min(1, p + delta * 0.8));
    }
  });

  const { geometry, colors } = useMemo(() => {
    const segments = 20;
    const size = 10;
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    const positions = geo.attributes.position;
    const colorArr = new Float32Array(positions.count * 3);

    const matrix = data?.matrix || [];
    const rows = matrix.length || 12;
    const cols = (matrix[0] || []).length || 8;

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getY(i);

      // Map geometry coords to matrix indices
      const col = Math.floor(((x + size / 2) / size) * (cols - 1));
      const row = Math.floor(((z + size / 2) / size) * (rows - 1));
      const ci = Math.max(0, Math.min(cols - 1, col));
      const ri = Math.max(0, Math.min(rows - 1, row));

      const val = matrix[ri] ? matrix[ri][ci] || 0 : 0;
      const height = (val / 100) * 3;

      positions.setZ(i, height);

      // Color: purple (high) → red (low)
      const t = val / 100;
      const color = new THREE.Color();
      color.setHSL(0.75 - t * 0.45, 0.8, 0.4 + t * 0.2);
      colorArr[i * 3] = color.r;
      colorArr[i * 3 + 1] = color.g;
      colorArr[i * 3 + 2] = color.b;
    }

    geo.computeVertexNormals();
    geo.setAttribute('color', new THREE.BufferAttribute(colorArr, 3));

    return { geometry: geo, colors: colorArr };
  }, [data]);

  useEffect(() => {
    return () => {
      if (geometry) geometry.dispose();
    };
  }, [geometry]);

  return (
    <group>
      <mesh
        ref={meshRef}
        geometry={geometry}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[1, 1, morphProgress]}
      >
        <meshStandardMaterial
          vertexColors
          wireframe={wireframe}
          side={THREE.DoubleSide}
          metalness={0.1}
          roughness={0.6}
        />
      </mesh>

      {/* Wireframe toggle communicated via userData */}
      <mesh
        visible={false}
        userData={{ toggleWireframe: () => setWireframe((w) => !w), wireframe }}
      />
    </group>
  );
});

export default SurfacePlot3D;
