import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Authentic Moroccan zellige mosaic table — low round table
 * like you'd find in a traditional riad salon, with colorful
 * tile patterns made from geometry, wrought iron legs, and
 * warm weathered cedar wood rim.
 */
export default function Table3D() {
    const mosaicRef = useRef();

    useFrame((state) => {
        // Very subtle warm shimmer on the tiles
        if (mosaicRef.current) {
            mosaicRef.current.material.emissiveIntensity =
                0.03 + Math.sin(state.clock.elapsedTime * 0.2) * 0.01;
        }
    });

    const seg = 48;

    // Zellige tile colors — authentic Moroccan palette
    const tileColors = ['#1a6b5a', '#c9a84c', '#2a5a8a', '#8b3a3a', '#d4823a', '#1a4a3a'];

    return (
        <group position={[0, 0, 0]}>

            {/* ══════════ WROUGHT IRON LEGS — 3 curved legs ══════════ */}
            {[0, 1, 2].map((i) => {
                const angle = (i / 3) * Math.PI * 2 + Math.PI / 6;
                const lx = Math.cos(angle) * 2.1;
                const lz = Math.sin(angle) * 2.1;
                return (
                    <group key={`leg-${i}`} position={[lx, -0.45, lz]}>
                        {/* Main iron bar */}
                        <mesh castShadow receiveShadow>
                            <cylinderGeometry args={[0.04, 0.06, 0.8, 8]} />
                            <meshPhysicalMaterial
                                color="#1a1a1a"
                                metalness={0.85}
                                roughness={0.4}
                                clearcoat={0.3}
                            />
                        </mesh>
                        {/* Decorative scroll at top */}
                        <mesh position={[0, 0.3, 0]} rotation={[0, angle, Math.PI / 6]}>
                            <torusGeometry args={[0.08, 0.015, 6, 12, Math.PI]} />
                            <meshPhysicalMaterial
                                color="#1a1a1a"
                                metalness={0.85}
                                roughness={0.4}
                            />
                        </mesh>
                        {/* Iron foot pad */}
                        <mesh position={[0, -0.42, 0]}>
                            <cylinderGeometry args={[0.07, 0.08, 0.03, 8]} />
                            <meshPhysicalMaterial
                                color="#1a1a1a"
                                metalness={0.85}
                                roughness={0.4}
                            />
                        </mesh>
                    </group>
                );
            })}



            {/* ══════════ TABLE TOP BASE — Concrete/plaster slab ══════════ */}
            <mesh position={[0, 0.04, 0]} receiveShadow castShadow>
                <cylinderGeometry args={[2.95, 2.95, 0.1, seg]} />
                <meshPhysicalMaterial
                    color="#d4c8a8"
                    roughness={0.85}
                    metalness={0.02}
                />
            </mesh>

            {/* ══════════ ZELLIGE MOSAIC SURFACE — Star pattern ══════════ */}
            <mesh ref={mosaicRef} position={[0, 0.1, 0]} receiveShadow>
                <cylinderGeometry args={[2.75, 2.75, 0.03, seg]} />
                <meshPhysicalMaterial
                    color="#2a1a0e"
                    roughness={0.85}
                    metalness={0.03}
                    clearcoat={0.3}
                    clearcoatRoughness={0.4}
                    emissive="#150c05"
                    emissiveIntensity={0.03}
                />
            </mesh>

            {/* Zellige tile rings — flat concentric colored bands on the surface */}
            {[
                { inner: 2.45, outer: 2.6 },
                { inner: 2.05, outer: 2.2 },
                { inner: 1.55, outer: 1.7 },
                { inner: 0.95, outer: 1.1 },
                { inner: 0.35, outer: 0.5 },
            ].map((ring, i) => (
                <mesh key={`ring-${i}`} position={[0, 0.116, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[ring.inner, ring.outer, seg]} />
                    <meshPhysicalMaterial
                        color={tileColors[i % tileColors.length]}
                        roughness={0.5}
                        metalness={0.1}
                        clearcoat={0.5}
                        clearcoatRoughness={0.2}
                    />
                </mesh>
            ))}

            {/* Star pattern tiles — 8 radial lines flat on surface */}
            {Array.from({ length: 8 }).map((_, i) => {
                const angle = (i / 8) * Math.PI * 2;
                return (
                    <group key={`star-${i}`}>
                        {/* Radial tile line */}
                        <mesh
                            position={[Math.cos(angle) * 1.4, 0.117, Math.sin(angle) * 1.4]}
                            rotation={[-Math.PI / 2, 0, angle]}
                        >
                            <planeGeometry args={[0.05, 2.2]} />
                            <meshPhysicalMaterial
                                color={tileColors[(i + 2) % tileColors.length]}
                                roughness={0.5}
                                metalness={0.1}
                                clearcoat={0.5}
                            />
                        </mesh>
                        {/* Diamond accent at intersection */}
                        <mesh
                            position={[Math.cos(angle) * 1.9, 0.118, Math.sin(angle) * 1.9]}
                            rotation={[-Math.PI / 2, 0, angle + Math.PI / 4]}
                        >
                            <planeGeometry args={[0.12, 0.12]} />
                            <meshPhysicalMaterial
                                color={tileColors[(i + 4) % tileColors.length]}
                                roughness={0.4}
                                metalness={0.15}
                                clearcoat={0.6}
                            />
                        </mesh>
                    </group>
                );
            })}

            {/* ══════════ CEDAR WOOD RIM — Flat ring edge ══════════ */}
            <mesh position={[0, 0.116, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow>
                <ringGeometry args={[2.75, 2.95, seg]} />
                <meshPhysicalMaterial
                    color="#6a4a2a"
                    roughness={0.75}
                    metalness={0.03}
                    clearcoat={0.2}
                    clearcoatRoughness={0.5}
                />
            </mesh>

            {/* Center play area — subtle lighter circle */}
            <mesh position={[0, 0.116, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.35, 32]} />
                <meshPhysicalMaterial
                    color="#f0e8d0"
                    roughness={0.6}
                    metalness={0.05}
                    clearcoat={0.4}
                    transparent
                    opacity={0.5}
                />
            </mesh>
        </group>
    );
}
