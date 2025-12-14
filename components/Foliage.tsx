import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CONFIG, COLORS } from '../constants';
import { HandData } from '../types';

const FoliageShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uColorA: { value: COLORS.EMERALD_DEEP },
    uColorB: { value: COLORS.GOLD_HIGH },
    uPixelRatio: { value: 1 }
  },
  vertexShader: `
    uniform float uTime;
    uniform float uPixelRatio;
    attribute float aScale;
    attribute vec3 aRandomness;
    
    varying vec3 vPosition;
    
    void main() {
      vPosition = position;
      vec4 modelPosition = modelMatrix * vec4(position, 1.0);
      
      // Wind effect
      modelPosition.x += sin(uTime * 2.0 + modelPosition.y) * 0.05;
      
      vec4 viewPosition = viewMatrix * modelPosition;
      vec4 projectionPosition = projectionMatrix * viewPosition;
      
      gl_Position = projectionPosition;
      gl_PointSize = aScale * uPixelRatio * (50.0 / -viewPosition.z);
    }
  `,
  fragmentShader: `
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    
    void main() {
      float strength = distance(gl_PointCoord, vec2(0.5));
      strength = 1.0 - strength;
      strength = pow(strength, 5.0);
      
      vec3 color = mix(uColorA, uColorB, strength * 0.5);
      
      gl_FragColor = vec4(color, strength);
      if(strength < 0.1) discard;
    }
  `
};

interface FoliageProps {
  handData: HandData;
}

export const Foliage: React.FC<FoliageProps> = ({ handData }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const { positions, chaosPositions, scales, randomness } = useMemo(() => {
    const pos = new Float32Array(CONFIG.FOLIAGE_COUNT * 3);
    const chaos = new Float32Array(CONFIG.FOLIAGE_COUNT * 3);
    const sc = new Float32Array(CONFIG.FOLIAGE_COUNT);
    const rnd = new Float32Array(CONFIG.FOLIAGE_COUNT * 3);

    for (let i = 0; i < CONFIG.FOLIAGE_COUNT; i++) {
      // FORMED: Cone shape
      const heightPercent = Math.random();
      const y = heightPercent * CONFIG.TREE_HEIGHT - (CONFIG.TREE_HEIGHT / 2);
      const radiusAtHeight = (1 - heightPercent) * CONFIG.TREE_RADIUS;
      const angle = Math.random() * Math.PI * 2;
      // Distribute volume
      const r = Math.sqrt(Math.random()) * radiusAtHeight; 
      
      pos[i * 3] = r * Math.cos(angle);
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = r * Math.sin(angle);

      // CHAOS: Random Sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const chaosR = CONFIG.CHAOS_RADIUS * Math.cbrt(Math.random());
      
      chaos[i * 3] = chaosR * Math.sin(phi) * Math.cos(theta);
      chaos[i * 3 + 1] = chaosR * Math.sin(phi) * Math.sin(theta);
      chaos[i * 3 + 2] = chaosR * Math.cos(phi);

      sc[i] = Math.random() * 5 + 2;
      
      rnd[i * 3] = Math.random();
      rnd[i * 3 + 1] = Math.random();
      rnd[i * 3 + 2] = Math.random();
    }
    return { positions: pos, chaosPositions: chaos, scales: sc, randomness: rnd };
  }, []);

  // BufferAttributes for current position
  const currentPositions = useMemo(() => new Float32Array(positions), [positions]);

  useFrame((state) => {
    if (!pointsRef.current || !materialRef.current) return;

    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    materialRef.current.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);

    // Lerp positions
    const targetArray = handData.state === 'CHAOS' ? chaosPositions : positions;
    const speed = handData.state === 'CHAOS' ? 0.05 : 0.03;

    const attr = pointsRef.current.geometry.attributes.position;
    
    for (let i = 0; i < CONFIG.FOLIAGE_COUNT; i++) {
      const ix = i * 3;
      const iy = i * 3 + 1;
      const iz = i * 3 + 2;

      currentPositions[ix] += (targetArray[ix] - currentPositions[ix]) * speed;
      currentPositions[iy] += (targetArray[iy] - currentPositions[iy]) * speed;
      currentPositions[iz] += (targetArray[iz] - currentPositions[iz]) * speed;
    }
    
    attr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={CONFIG.FOLIAGE_COUNT}
          array={currentPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aScale"
          count={CONFIG.FOLIAGE_COUNT}
          array={scales}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aRandomness"
          count={CONFIG.FOLIAGE_COUNT}
          array={randomness}
          itemSize={3}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        attach="material"
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        {...FoliageShaderMaterial}
      />
    </points>
  );
};
