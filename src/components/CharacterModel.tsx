import { useGLTF, useAnimations } from '@react-three/drei';
import { useEffect, useRef, useState } from 'react';
import { Group } from 'three';

type CharacterModelProps = {
  isMoving: boolean;
  isSprinting: boolean;
  isGrounded: boolean;
};

export function CharacterModel({ isMoving, isSprinting, isGrounded }: CharacterModelProps) {
  const group = useRef<Group>(null);
  const [currentAnimation, setCurrentAnimation] = useState<string | null>(null);
  
  // Replace '/models/character.glb' with your model's path
  // For example: '/models/your-character.glb'
  const { scene, animations } = useGLTF('/models/character.glb');
  const { actions } = useAnimations(animations, group);

  // Enable shadows for all meshes in the model
  scene.traverse((child) => {
    if ('material' in child) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  useEffect(() => {
    // Map your model's animation names here
    // Common animation names might be: 'Idle', 'Walk', 'Run', 'Jump', etc.
    let targetAnimation = 'IDLE'; // Replace with your idle animation name
    
    if (!isGrounded) {
      targetAnimation = 'FALL'; // Replace with your fall/jump animation name
    } else if (isMoving) {
      targetAnimation = 'RUN'; // Replace with your walk/run animation name
    }
    
    // If animation exists, play it
    const nextAction = actions[targetAnimation];
    if (!nextAction) {
      console.warn(`Animation "${targetAnimation}" not found in model`);
      return;
    }

    // Handle animation transitions
    if (!currentAnimation) {
      nextAction.reset().play();
      nextAction.timeScale = isMoving && isSprinting ? 1.25 : 1;
      setCurrentAnimation(targetAnimation);
      return;
    }
    
    // Crossfade to new animation
    const prevAction = actions[currentAnimation];
    if (prevAction && targetAnimation !== currentAnimation) {
      nextAction.reset().play();
      nextAction.timeScale = isMoving && isSprinting ? 1.25 : 1;
      prevAction.crossFadeTo(nextAction, 0.15, true);
      setCurrentAnimation(targetAnimation);
    }
  }, [actions, isMoving, isSprinting, isGrounded]);

  return (
    <primitive 
      ref={group} 
      object={scene} 
      // Adjust these values based on your model's size and orientation
      scale={1.5}
      rotation={[0, Math.PI, 0]} // Rotate if needed to face forward
    />
  );
}

// Pre-load the model
useGLTF.preload('/models/character.glb');