import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Cylinder, Box, MeshDistortMaterial } from '@react-three/drei';

export function Avatar({ isSpeaking, ...props }) {
  const mouthRef = useRef();
  const faceGroupRef = useRef();
  
  // Animate the mouth and add a slight hover/breathing animation to the face
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    
    // Breathing motion for the head
    if (faceGroupRef.current) {
      faceGroupRef.current.position.y = Math.sin(t * 1.5) * 0.05 + 0.2;
      // Slight turning left/right randomly
      faceGroupRef.current.rotation.y = Math.sin(t * 0.8) * 0.1;
    }

    // Speaking mouth animation
    if (mouthRef.current) {
      if (isSpeaking) {
        // Rapid pseudo-random sequence of mouth movements
        const open = Math.sin(t * 15) * 0.5 + 0.5;
        const width = Math.cos(t * 12) * 0.2 + 0.8;
        
        // Scale the mouth Y (openness) and X (width)
        mouthRef.current.scale.y = 0.2 + open * 0.8;
        mouthRef.current.scale.x = 0.8 + width * 0.2;
      } else {
        // Close mouth naturally
        mouthRef.current.scale.y = 0.2;
        mouthRef.current.scale.x = 1.0;
      }
    }
  });

  return (
    <group ref={faceGroupRef} {...props} scale={[0.9, 0.9, 0.9]} position={[0, -0.2, 0]}>
      {/* Head Base - Holographic/Glassmorphic AI look */}
      <Sphere args={[1, 64, 64]} position={[0, 0, 0]}>
        <MeshDistortMaterial 
          color="#a8b2ff" 
          attach="material" 
          distort={isSpeaking ? 0.3 : 0.15} 
          speed={isSpeaking ? 4 : 2} 
          roughness={0.2}
          metalness={0.8}
          transparent={true}
          opacity={0.85}
        />
      </Sphere>

      {/* Hair outline (Stylized bob cut for a female look) */}
      <Sphere args={[1.05, 32, 32]} position={[0, 0.1, -0.1]}>
        <meshStandardMaterial color="#1e1b4b" roughness={0.7} />
      </Sphere>
      
      {/* Eyes */}
      <group position={[0, 0.15, 0.85]}>
        {/* Left Eye */}
        <Box args={[0.2, 0.08, 0.1]} position={[-0.35, 0, 0]} rotation={[0, 0, 0.1]}>
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
        </Box>
        {/* Right Eye */}
        <Box args={[0.2, 0.08, 0.1]} position={[0.35, 0, 0]} rotation={[0, 0, -0.1]}>
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
        </Box>
      </group>
      
      {/* Cheeks (blush) */}
      <Sphere args={[0.15, 16, 16]} position={[-0.45, -0.1, 0.85]}>
        <meshStandardMaterial color="#ff7eb3" transparent opacity={0.6} />
      </Sphere>
      <Sphere args={[0.15, 16, 16]} position={[0.45, -0.1, 0.85]}>
        <meshStandardMaterial color="#ff7eb3" transparent opacity={0.6} />
      </Sphere>

      {/* Mouth */}
      <Box ref={mouthRef} args={[0.3, 0.2, 0.1]} position={[0, -0.35, 0.9]}>
        <meshStandardMaterial color="#1e1b4b" />
      </Box>

      {/* Neck */}
      <Cylinder args={[0.3, 0.4, 0.8, 32]} position={[0, -0.9, 0]}>
        <meshStandardMaterial color="#a8b2ff" roughness={0.4} />
      </Cylinder>
    </group>
  );
}
