import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { CONFIG, COLORS } from '../constants';
import { HandData } from '../types';

interface OrnamentProps {
  handData: HandData;
}

export const Ornaments: React.FC<OrnamentProps> = ({ handData }) => {
  const baubleRef = useRef<THREE.InstancedMesh>(null);
  const giftRef = useRef<THREE.InstancedMesh>(null);
  const photoRef = useRef<THREE.InstancedMesh>(null);
  
  // Dummy object for matrix calculations
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // --- Data Generation ---
  const generateData = (count: number, scaleRange: [number, number]) => {
    const formPos = [];
    const chaosPos = [];
    const rot = [];
    
    for (let i = 0; i < count; i++) {
        // Formed (Tree Surface)
        const heightPercent = Math.random();
        const y = heightPercent * CONFIG.TREE_HEIGHT - (CONFIG.TREE_HEIGHT / 2);
        const radiusAtHeight = (1 - heightPercent) * CONFIG.TREE_RADIUS;
        const angle = Math.random() * Math.PI * 2;
        // Place on surface usually
        const r = radiusAtHeight + (Math.random() * 0.5); // Slightly stick out
        formPos.push(new THREE.Vector3(r * Math.cos(angle), y, r * Math.sin(angle)));

        // Chaos (Wide Sphere)
        const cR = CONFIG.CHAOS_RADIUS * 1.2; // Further out than foliage
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        chaosPos.push(new THREE.Vector3(
            cR * Math.sin(phi) * Math.cos(theta),
            cR * Math.sin(phi) * Math.sin(theta),
            cR * Math.cos(phi)
        ));

        // Random rotations
        rot.push(new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0));
    }
    return { formPos, chaosPos, rot };
  };

  const baubles = useMemo(() => generateData(CONFIG.ORNAMENT_COUNT, [0.3, 0.5]), []);
  const gifts = useMemo(() => generateData(20, [0.6, 0.8]), []); // Fewer gifts at bottom?
  // Override gift positions to be lower
  useMemo(() => {
    gifts.formPos.forEach(v => {
        v.y = -CONFIG.TREE_HEIGHT/2 + Math.random() * 2; // Bottom 2 units
        v.x *= 1.5; v.z *= 1.5; // Wider at base
    });
  }, [gifts]);

  const photos = useMemo(() => generateData(CONFIG.PHOTO_COUNT, [0.8, 0.8]), []);

  // --- Animation Loop ---
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const isChaos = handData.state === 'CHAOS';
    
    // Animate Baubles
    if (baubleRef.current) {
        for (let i = 0; i < CONFIG.ORNAMENT_COUNT; i++) {
            const target = isChaos ? baubles.chaosPos[i] : baubles.formPos[i];
            
            // Current pos interpolation (hacky direct matrix access for smooth visual)
            // Ideally we track currentPos in a separate Float32Array but for < 1000 items, matrix extraction is OK-ish on desktop
            baubleRef.current.getMatrixAt(i, dummy.matrix);
            dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
            
            dummy.position.lerp(target, 0.05 + (i % 10)*0.002); // Varying speeds
            dummy.rotation.x += 0.01;
            dummy.rotation.y += 0.01;
            dummy.updateMatrix();
            baubleRef.current.setMatrixAt(i, dummy.matrix);
        }
        baubleRef.current.instanceMatrix.needsUpdate = true;
    }

    // Animate Gifts (Slower/Heavier)
    if (giftRef.current) {
        for (let i = 0; i < 20; i++) {
            const target = isChaos ? gifts.chaosPos[i] : gifts.formPos[i];
            giftRef.current.getMatrixAt(i, dummy.matrix);
            dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
            
            dummy.position.lerp(target, 0.02); // Slower
            dummy.rotation.x = Math.sin(t + i); // Bobbing
            dummy.updateMatrix();
            giftRef.current.setMatrixAt(i, dummy.matrix);
        }
        giftRef.current.instanceMatrix.needsUpdate = true;
    }

    // Animate Photos
    if (photoRef.current) {
        for (let i = 0; i < CONFIG.PHOTO_COUNT; i++) {
             const target = isChaos ? photos.chaosPos[i] : photos.formPos[i];
             photoRef.current.getMatrixAt(i, dummy.matrix);
             dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
             
             dummy.position.lerp(target, 0.04);
             // Look at center if formed, tumble if chaos
             if (!isChaos) {
                 dummy.lookAt(0, dummy.position.y, 0);
             } else {
                 dummy.rotation.z += 0.02;
             }
             dummy.updateMatrix();
             photoRef.current.setMatrixAt(i, dummy.matrix);
        }
        photoRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
        {/* Baubles - Gold and Red */}
        <instancedMesh ref={baubleRef} args={[undefined, undefined, CONFIG.ORNAMENT_COUNT]}>
            <sphereGeometry args={[0.25, 16, 16]} />
            <meshStandardMaterial 
                color={COLORS.GOLD_HIGH} 
                roughness={0.1} 
                metalness={1} 
                emissive={COLORS.GOLD_DARK}
                emissiveIntensity={0.2}
            />
        </instancedMesh>

        {/* Gifts - Boxes */}
        <instancedMesh ref={giftRef} args={[undefined, undefined, 20]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial 
                color={COLORS.RED_VELVET} 
                roughness={0.4} 
            />
        </instancedMesh>

         {/* Polaroid-style Photos */}
         <instancedMesh ref={photoRef} args={[undefined, undefined, CONFIG.PHOTO_COUNT]}>
            <planeGeometry args={[0.8, 1]} />
            <meshBasicMaterial color="#fffff0" side={THREE.DoubleSide}>
                 {/*  A real implementation would use texture atlas, simple white frame here for ease */}
            </meshBasicMaterial>
        </instancedMesh>
    </group>
  );
};
