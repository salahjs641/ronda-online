import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Realistic Moroccan card table — octagonal carved wood with rich green felt,
 * ornate brass studs, padded rail, and subtle felt shimmer.
 */
export default function Table3D() {
    const feltRef = useRef();

    // Subtle felt shimmer — warm breathing glow
    useFrame((state) => {
        if (feltRef.current) {
            feltRef.current.material.emissiveIntensity =
                0.06 + Math.sin(state.clock.elapsedTime * 0.4) * 0.02;
        }
    });

    // Octagonal shape for authentic card table feel
    const segments = 8;

    return (
        <group position={[0, 0, 0]}>

            {/* ══════════ TABLE LEGS — Four carved wood legs ══════════ */}
            {[0, 1, 2, 3].map((i) => {
                const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
                const legX = Math.cos(angle) * 2.2;
                const legZ = Math.sin(angle) * 2.2;
                return (
                    <group key={`leg-${i}`} position={[legX, -0.6, legZ]}>
                        {/* Main leg shaft */}
                        <mesh castShadow receiveShadow>
                            <cylinderGeometry args={[0.08, 0.12, 1.0, 8]} />
                            <meshPhysicalMaterial
                                color="#3a200e"
                                roughness={0.5}
                                metalness={0.05}
                                clearcoat={0.6}
                                clearcoatRoughness={0.15}
                            />
                        </mesh>
                        {/* Ornate bulge detail */}
                        <mesh position={[0, 0.15, 0]} castShadow>
                            <sphereGeometry args={[0.12, 8, 6]} />
                            <meshPhysicalMaterial
                                color="#4a2a12"
                                roughness={0.4}
                                clearcoat={0.7}
                                clearcoatRoughness={0.1}
                            />
                        </mesh>
                        {/* Foot pad */}
                        <mesh position={[0, -0.52, 0]}>
                            <cylinderGeometry args={[0.14, 0.16, 0.04, 8]} />
                            <meshPhysicalMaterial
                                color="#8b6914"
                                metalness={0.7}
                                roughness={0.3}
                                clearcoat={0.4}
                            />
                        </mesh>
                    </group>
                );
            })}

            {/* ══════════ TABLE FRAME — Thick carved wood apron ══════════ */}
            <mesh position={[0, -0.08, 0]} receiveShadow castShadow>
                <cylinderGeometry args={[2.85, 2.95, 0.18, segments]} />
                <meshPhysicalMaterial
                    color="#2e1508"
                    roughness={0.45}
                    metalness={0.05}
                    clearcoat={0.5}
                    clearcoatRoughness={0.15}
                />
            </mesh>

            {/* ══════════ TABLE TOP — Thick wooden slab ══════════ */}
            <mesh position={[0, 0.02, 0]} receiveShadow castShadow>
                <cylinderGeometry args={[3.1, 3.1, 0.12, segments]} />
                <meshPhysicalMaterial
                    color="#3a1d0a"
                    roughness={0.35}
                    metalness={0.05}
                    clearcoat={0.7}
                    clearcoatRoughness={0.1}
                />
            </mesh>

            {/* ══════════ PADDED RAIL — Leather bumper around edge ══════════ */}
            <mesh position={[0, 0.14, 0]} receiveShadow castShadow>
                <torusGeometry args={[3.05, 0.08, 12, segments]} />
                <meshPhysicalMaterial
                    color="#2a1206"
                    roughness={0.7}
                    metalness={0.0}
                    clearcoat={0.3}
                    clearcoatRoughness={0.4}
                />
            </mesh>

            {/* ══════════ PLAYING SURFACE — Rich green felt ══════════ */}
            <mesh ref={feltRef} position={[0, 0.09, 0]} receiveShadow>
                <cylinderGeometry args={[2.85, 2.85, 0.03, segments]} />
                <meshPhysicalMaterial
                    color="#1a5c38"
                    roughness={0.95}
                    metalness={0}
                    clearcoat={0}
                    emissive="#0d3020"
                    emissiveIntensity={0.06}
                />
            </mesh>

            {/* ══════════ GOLD TRIM — Outer brass inlay ring ══════════ */}
            <mesh position={[0, 0.11, 0]}>
                <torusGeometry args={[2.83, 0.02, 8, segments]} />
                <meshPhysicalMaterial
                    color="#d4a84c"
                    metalness={0.9}
                    roughness={0.15}
                    clearcoat={0.8}
                    emissive="#b39030"
                    emissiveIntensity={0.15}
                />
            </mesh>

            {/* Inner decorative brass ring */}
            <mesh position={[0, 0.11, 0]}>
                <torusGeometry args={[1.5, 0.012, 8, segments]} />
                <meshPhysicalMaterial
                    color="#d4a84c"
                    metalness={0.85}
                    roughness={0.2}
                    clearcoat={0.6}
                    emissive="#8c6b1a"
                    emissiveIntensity={0.1}
                />
            </mesh>

            {/* ══════════ BRASS CORNER STUDS — At each octagonal vertex ══════════ */}
            {Array.from({ length: segments }).map((_, i) => {
                const angle = (i / segments) * Math.PI * 2;
                const studX = Math.cos(angle) * 2.92;
                const studZ = Math.sin(angle) * 2.92;
                return (
                    <mesh key={`stud-${i}`} position={[studX, 0.12, studZ]}>
                        <sphereGeometry args={[0.04, 8, 6]} />
                        <meshPhysicalMaterial
                            color="#c99b30"
                            metalness={0.95}
                            roughness={0.1}
                            clearcoat={0.9}
                            emissive="#a07820"
                            emissiveIntensity={0.2}
                        />
                    </mesh>
                );
            })}

            {/* ══════════ CARD DISCARD AREA — Subtle center marking ══════════ */}
            <mesh position={[0, 0.105, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.8, 0.85, segments]} />
                <meshPhysicalMaterial
                    color="#1e7048"
                    roughness={1}
                    metalness={0}
                    transparent
                    opacity={0.3}
                />
            </mesh>
        </group>
    );
}
