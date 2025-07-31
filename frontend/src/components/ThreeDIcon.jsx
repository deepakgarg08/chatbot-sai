import { Canvas, useFrame } from '@react-three/fiber';
import { animated, useSpring } from '@react-spring/three';
import { useEffect, useRef } from 'react';

function AnimatedTorusKnot({ state }) {
  const meshRef = useRef();

  const [spring, api] = useSpring(() => ({
    scale: 1,
    color: '#ff5ecd',
    emissive: '#60a5fa',
    metalness: 0.8,
    roughness: 0.1,
  }));

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.014;
    }
  });

  useEffect(() => {
    if (state === 'sent') {
      api.start({ scale: 1.6, color: '#34d399', emissive: '#8b5cf6', metalness: 1 });
      setTimeout(() => api.start({ scale: 1, color: '#ff5ecd', emissive: '#60a5fa', metalness: 0.8 }), 900);
    } else if (state === 'received') {
      api.start({ scale: 1.3, color: '#fbbf24', emissive: '#f59e42', metalness: 0.5 });
      setTimeout(() => api.start({ scale: 1, color: '#ff5ecd', emissive: '#60a5fa', metalness: 0.8 }), 900);
    } else {
      api.start({ scale: 1, color: '#ff5ecd', emissive: '#60a5fa', metalness: 0.8 });
    }
  }, [state, api]);

  return (
    <animated.mesh
      ref={meshRef}
      scale-x={spring.scale}
      scale-y={spring.scale}
      scale-z={spring.scale}
    >
      <torusKnotGeometry args={[1.5, 0.43, 120, 20]} />
      <animated.meshStandardMaterial
        color={spring.color}
        metalness={spring.metalness}
        roughness={spring.roughness}
        emissive={spring.emissive}
        emissiveIntensity={1.3}
      />
    </animated.mesh>
  );
}

export default function ThreeDIcon({ state }) {
  return (
    <div className="flex justify-center items-center mb-3" style={{ width: '96px', height: '96px' }}>
      <Canvas>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} />
        <AnimatedTorusKnot state={state} />
      </Canvas>
    </div>
  );
}
