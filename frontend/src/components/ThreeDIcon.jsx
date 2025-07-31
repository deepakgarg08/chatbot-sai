import { Canvas } from '@react-three/fiber'
import { animated, useSpring } from '@react-spring/three';

import { useEffect } from 'react'
import { Sphere } from '@react-three/drei'

export default function ThreeDIcon({ trigger, className }) {
  const [spring, api] = useSpring(() => ({ scale: 1 }));

  useEffect(() => {
    if (trigger) {
      api.start({ scale: 1.5, reset: true, onRest: () => api.start({ scale: 1 }) });
    }
  }, [trigger, api]);

  return (
    <div className={className}>
      <Canvas>
        <ambientLight />
        <animated.mesh scale-x={spring.scale} scale-y={spring.scale} scale-z={spring.scale}>
          <Sphere args={[1, 32, 32]}>
            <meshStandardMaterial color="tomato" />
          </Sphere>
        </animated.mesh>
      </Canvas>
    </div>
  );
}
