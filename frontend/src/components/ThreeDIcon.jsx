import { Canvas, useFrame } from '@react-three/fiber';
import { animated, useSpring, config } from '@react-spring/three';
import { useRef, useEffect, useState } from 'react';

function lerpColor(a, b, t) {
  // Linear interpolation between two RGB hex colors
  const ah = a.replace(/^#/, ''), bh = b.replace(/^#/, '');
  const ar = parseInt(ah.substring(0,2), 16), ag = parseInt(ah.substring(2,4), 16), ab = parseInt(ah.substring(4,6), 16);
  const br = parseInt(bh.substring(0,2), 16), bg = parseInt(bh.substring(2,4), 16), bb = parseInt(bh.substring(4,6), 16);
  const rr = Math.round(ar + (br-ar)*t).toString(16).padStart(2, '0');
  const rg = Math.round(ag + (bg-ag)*t).toString(16).padStart(2, '0');
  const rb = Math.round(ab + (bb-ab)*t).toString(16).padStart(2, '0');
  return `#${rr}${rg}${rb}`;
}

function AnimatedTorusKnot({ state, side }) {
  const meshRef = useRef();
  const [color, setColor] = useState('#ff0000');        // Start with red
  const [emissive, setEmissive] = useState('#ff0000');  // Start with red

  // Static mode: animate color from red to green
  useEffect(() => {
    let frame;
    if (state === 'static') {
      let t = 0;
      const animate = () => {
        t = (t + 0.01) % 2;
        // t 0-1 goes red -> green, 1-2 goes green -> red
        const lerp = t <= 1 ? t : 2-t;
        const newCol = lerpColor('#ff0000', '#00ff00', lerp);
        setColor(newCol);
        setEmissive(newCol);
        frame = requestAnimationFrame(animate);
      };
      animate();
      return () => frame && cancelAnimationFrame(frame);
    }
    if (state === 'sent' && side === 'sender') {
      setColor('#2563eb');       // Tailwind blue-600
      setEmissive('#3b82f6');    // Tailwind blue-500
    } else if (state === 'sent' && side === 'receiver') {
      setColor('#ef4444');       // Tailwind red-500
      setEmissive('#b91c1c');    // Tailwind red-700
    } else if (state === 'received' && side === 'receiver') {
      setColor('#ef4444');       // Tailwind red-500
      setEmissive('#b91c1c');
    }
    // Fallback to red when not static and not sending
    if (state !== 'static' && state !== 'sent' && state !== 'received') {
      setColor('#ff0000');
      setEmissive('#ff0000');
    }
  }, [state, side]);

  // Rotation speed: fast when sending, slow/static otherwise
  useFrame(() => {
    if (meshRef.current) {
      if (state === 'sent') {
        meshRef.current.rotation.y += 0.12;
        meshRef.current.rotation.x += 0.1;
      } else {
        meshRef.current.rotation.y += 0.008;
        meshRef.current.rotation.x += 0.006;
      }
    }
  });

  return (
    <animated.mesh ref={meshRef} scale={[1, 1, 1]}>
      <torusKnotGeometry args={[1.5, 0.43, 120, 20]} />
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={1.25}
        metalness={0.93}
        roughness={0.13}
      />
    </animated.mesh>
  );
}

export default function ThreeDIcon({ state, side = 'static', size = 'large' }) {
  const sizeClass = size === 'large' ? 'w-48 h-48' : 'w-24 h-24';
  return (
    <div className={`flex justify-center items-center mb-3 ${sizeClass}`}>
      <Canvas>
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} />
        <AnimatedTorusKnot state={state} side={side} />
      </Canvas>
    </div>
  );
}
