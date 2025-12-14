import React, { useContext, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { AppContext } from '../App';
import { Foliage } from './Foliage';
import { Ornaments } from './Ornaments';
import { CONFIG } from '../constants';

const CameraController = () => {
  const { handData } = useContext(AppContext);
  const vec = new THREE.Vector3();

  useFrame((state) => {
    // Map hand X/Y (0-1) to camera position
    // Center is 0.5. Left is 0, Right is 1.
    // Invert X for mirror feel.
    const targetX = (handData.x - 0.5) * -15; 
    const targetY = 4 + (handData.y - 0.5) * 10;
    
    // Smooth damp
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, 0.05);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.05);
    state.camera.lookAt(0, 2, 0);
  });
  return null;
};

export const Experience: React.FC = () => {
  const { handData } = useContext(AppContext);

  return (
    <Canvas
      gl={{ antialias: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
      dpr={[1, 2]}
    >
      <PerspectiveCamera makeDefault position={[0, 4, CONFIG.CAMERA_Z]} fov={50} />
      <CameraController />
      
      {/* Lighting */}
      <ambientLight intensity={0.2} color="#001a0f" />
      <Environment preset="lobby" />
      
      <group position={[0, -2, 0]}>
        <Foliage handData={handData} />
        <Ornaments handData={handData} />
      </group>

      {/* Post Processing */}
      <EffectComposer disableNormalPass>
        <Bloom 
            luminanceThreshold={CONFIG.BLOOM_THRESHOLD} 
            mipmapBlur 
            intensity={CONFIG.BLOOM_INTENSITY} 
            radius={0.6}
        />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </Canvas>
  );
};
