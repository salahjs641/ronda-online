import React, { useRef, useState, Suspense } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { useTexture, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

function CardMesh({ card, position, rotation, onClick, isPlayable, scale, hovered, setHovered }) {
    const meshRef = useRef();
    const baseY = useRef(position[1]);

    // Load texture using .PNG to match what's in the assets folder
    const texturePath = `/assets/cards/${card.suit}_${card.value}.PNG`;
    const frontTex = useTexture(texturePath);
    frontTex.colorSpace = THREE.SRGBColorSpace;

    // Hover lift animation
    useFrame((_, delta) => {
        if (!meshRef.current) return;
        const targetY = baseY.current + (hovered && isPlayable ? 0.3 : 0);
        meshRef.current.position.y += (targetY - meshRef.current.position.y) * 10 * delta;
    });

    const w = 0.55 * scale;
    const h = 0.8 * scale;
    const thickness = 0.018 * scale; // Thicker casino card stock

    return (
        <group
            ref={meshRef}
            position={position}
            rotation={rotation || [0, 0, 0]}
            onClick={(e) => { e.stopPropagation(); if (isPlayable && onClick) onClick(); }}
            onPointerOver={(e) => { e.stopPropagation(); setHovered(true); if (isPlayable) document.body.style.cursor = 'pointer'; }}
            onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
        >
            {/* ══ MESH BODY: Highly realistic rounded edges ══ */}
            <RoundedBox args={[w, h, thickness]} radius={0.02 * scale} smoothness={4} castShadow receiveShadow>
                {/* Physical material for realistic thick card stock */}
                <meshPhysicalMaterial
                    color="#f5f0e8"
                    roughness={0.8}
                    clearcoat={0.05}
                    clearcoatRoughness={0.5}
                />
            </RoundedBox>

            {/* ══ FRONT FACE: Using physical material to catch dynamic light instead of basic ══ */}
            <mesh position={[0, 0, thickness / 2 + 0.001]} receiveShadow>
                <planeGeometry args={[w - 0.02, h - 0.02]} />
                <meshStandardMaterial
                    map={frontTex}
                    roughness={0.6}
                    metalness={0.0}
                />
            </mesh>

            {/* ══ BACK FACE ══ */}
            <mesh position={[0, 0, -thickness / 2 - 0.001]} rotation={[0, Math.PI, 0]} receiveShadow>
                <planeGeometry args={[w - 0.02, h - 0.02]} />
                <meshPhysicalMaterial
                    color="#470b0b"
                    roughness={0.4}
                    clearcoat={0.5}
                    clearcoatRoughness={0.2}
                />
            </mesh>

            {/* Playable glow border */}
            {isPlayable && (
                <mesh position={[0, -0.01, -thickness / 2 + 0.005]}>
                    <planeGeometry args={[w + 0.04, h + 0.04]} />
                    <meshBasicMaterial
                        color={hovered ? '#ffe159' : '#c9a84c'}
                        transparent
                        opacity={hovered ? 0.6 : 0.0}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            )}
        </group>
    );
}

// Wrapper that handles loading state with Suspense
function CardFallback({ position, rotation, scale }) {
    const w = 0.55 * scale;
    const h = 0.8 * scale;
    return (
        <group position={position} rotation={rotation || [0, 0, 0]}>
            <mesh>
                <boxGeometry args={[w, h, 0.012]} />
                <meshBasicMaterial color="#d4c9a8" />
            </mesh>
        </group>
    );
}

export default function Card3D({ card, position, rotation, onClick, isPlayable = false, scale = 1 }) {
    const [hovered, setHovered] = useState(false);

    return (
        <Suspense fallback={<CardFallback position={position} rotation={rotation} scale={scale} />}>
            <CardMesh
                card={card}
                position={position}
                rotation={rotation}
                onClick={onClick}
                isPlayable={isPlayable}
                scale={scale}
                hovered={hovered}
                setHovered={setHovered}
            />
        </Suspense>
    );
}
