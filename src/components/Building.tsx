import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import { useSpring, animated } from '@react-spring/three';
import { useRef, useState } from 'react';
import { Group, Vector3 } from 'three';

function Terminal({ position, rotation = [0, 0, 0] }: { position: [number, number, number], rotation?: [number, number, number] }) {
  const terminalRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  
  const { scale } = useSpring({
    scale: hovered ? 1.1 : 1,
    config: { tension: 300, friction: 10 }
  });

  return (
    <animated.group
      position={position}
      rotation={rotation}
      scale={scale}
      ref={terminalRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Monitor Base */}
      <mesh castShadow receiveShadow position={[0, 0.05, 0]}>
        <boxGeometry args={[0.4, 0.1, 0.4]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Monitor Stand */}
      <mesh castShadow receiveShadow position={[0, 0.3, 0]}>
        <boxGeometry args={[0.1, 0.5, 0.1]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Monitor Screen */}
      <mesh castShadow receiveShadow position={[0, 0.6, 0]}>
        <boxGeometry args={[1.2, 0.8, 0.1]} />
        <meshStandardMaterial color="#34495e" metalness={0.5} roughness={0.5} />
      </mesh>
      
      {/* Screen Display */}
      <mesh position={[0, 0.6, 0.06]}>
        <planeGeometry args={[1.1, 0.7]} />
        <meshStandardMaterial 
          color={hovered ? "#3498db" : "#2980b9"} 
          emissive={hovered ? "#3498db" : "#2980b9"}
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </animated.group>
  );
}

function TradingDesk({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Desk Surface */}
      <mesh castShadow receiveShadow position={[0, 0.8, 0]}>
        <boxGeometry args={[2, 0.1, 1]} />
        <meshStandardMaterial color="#95a5a6" metalness={0.3} roughness={0.7} />
      </mesh>
      
      {/* Desk Legs */}
      {[[-0.9, 0.4, -0.4], [0.9, 0.4, -0.4], [-0.9, 0.4, 0.4], [0.9, 0.4, 0.4]].map((pos, i) => (
        <mesh key={i} castShadow receiveShadow position={pos}>
          <boxGeometry args={[0.1, 0.8, 0.1]} />
          <meshStandardMaterial color="#7f8c8d" metalness={0.3} roughness={0.7} />
        </mesh>
      ))}
      
      {/* Terminals */}
      <Terminal position={[-0.5, 0.8, 0]} rotation={[0, 0.2, 0]} />
      <Terminal position={[0.5, 0.8, 0]} rotation={[0, -0.2, 0]} />
    </group>
  );
}

function WallDisplay({ position, rotation = [0, 0, 0] }: { position: [number, number, number], rotation?: [number, number, number] }) {
  const [hovered, setHovered] = useState(false);
  
  const { scale } = useSpring({
    scale: hovered ? 1.05 : 1,
    config: { tension: 300, friction: 10 }
  });

  return (
    <animated.group
      position={position}
      rotation={rotation}
      scale={scale}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Display Frame */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[4, 2, 0.1]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Screen */}
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[3.8, 1.8]} />
        <meshStandardMaterial 
          color={hovered ? "#e74c3c" : "#c0392b"}
          emissive={hovered ? "#e74c3c" : "#c0392b"}
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </animated.group>
  );
}

export function Building() {
  const { scene } = useGLTF('/models/building.glb');

  scene.traverse((child) => {
    if ('material' in child) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  // Create a grid of trading desks
  const desks = [];
  const rows = 3;
  const cols = 4;
  const spacing = 3;
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      desks.push(
        <TradingDesk 
          key={`desk-${row}-${col}`}
          position={[
            (col - (cols - 1) / 2) * spacing,
            0,
            (row - (rows - 1) / 2) * spacing
          ]}
        />
      );
    }
  }

  return (
    <RigidBody type="fixed" colliders="trimesh">
      {/* Floor */}
      <mesh receiveShadow position={[0, -0.1, 0]}>
        <boxGeometry args={[20, 0.2, 20]} />
        <meshStandardMaterial color="#34495e" metalness={0.2} roughness={0.8} />
      </mesh>

      {/* Walls */}
      <mesh receiveShadow position={[0, 5, -10]}>
        <boxGeometry args={[20, 10, 0.2]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.3} roughness={0.7} />
      </mesh>
      
      <mesh receiveShadow position={[0, 5, 10]}>
        <boxGeometry args={[20, 10, 0.2]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.3} roughness={0.7} />
      </mesh>
      
      <mesh receiveShadow position={[-10, 5, 0]}>
        <boxGeometry args={[0.2, 10, 20]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.3} roughness={0.7} />
      </mesh>
      
      <mesh receiveShadow position={[10, 5, 0]}>
        <boxGeometry args={[0.2, 10, 20]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.3} roughness={0.7} />
      </mesh>

      {/* Wall Displays */}
      <WallDisplay position={[0, 6, -9.8]} />
      <WallDisplay position={[-9.8, 6, 0]} rotation={[0, Math.PI / 2, 0]} />
      <WallDisplay position={[9.8, 6, 0]} rotation={[0, -Math.PI / 2, 0]} />

      {/* Trading Desks */}
      {desks}
    </RigidBody>
  );
}