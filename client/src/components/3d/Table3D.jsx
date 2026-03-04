import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Premium Moroccan card table — circular carved walnut with deep emerald felt,
 * intricate gold arabesques, polished leather armrest rail, and ambient warmth.
 */
export default function Table3D() {
    const feltRef = useRef();
    const arabesqueRef = useRef();

    // Subtle felt breathing + arabesque slow rotation
    useFrame((state) => {
        const t = state.clock.elapsedTime;
        if (feltRef.current) {
            feltRef.current.material.emissiveIntensity = 0.04 + Math.sin(t * 0.3) * 0.02;
        }
        if (arabesqueRef.current) {
            arabesqueRef.current.rotation.y = t * 0.015;
        }
    });

    const sides = 64; // Smooth circle

    return (
        <group position={[0, 0, 0]}>

            {/* ══════════ 4 CARVED CABRIOLE LEGS ══════════ */}
            {[0, 1, 2, 3].map((i) => {
                const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
                const lx = Math.cos(angle) * 2.3;
                const lz = Math.sin(angle) * 2.3;
                return (
                    <group key={`leg-${i}`} position={[lx, -0.55, lz]}>
                        {/* Upper thigh */}
                        <mesh castShadow receiveShadow>
                            <cylinderGeometry args={[0.1, 0.07, 0.4, 12]} />
                            <meshPhysicalMaterial
                                color="#2b140a"
                                roughness={0.35}
                                metalness={0.08}
                                clearcoat={0.8}
                                clearcoatRoughness={0.1}
                            />
                        </mesh>
                        {/* Mid bulge ornament */}
                        <mesh position={[0, -0.22, 0]} castShadow>
                            <sphereGeometry args={[0.10, 12, 10]} />
                            <meshPhysicalMaterial
                                color="#3d1e0e"
                                roughness={0.3}
                                clearcoat={0.85}
                                clearcoatRoughness={0.08}
                            />
                        </mesh>
                        {/* Lower taper */}
                        <mesh position={[0, -0.5, 0]} castShadow receiveShadow>
                            <cylinderGeometry args={[0.06, 0.09, 0.5, 12]} />
                            <meshPhysicalMaterial
                                color="#2b140a"
                                roughness={0.35}
                                clearcoat={0.8}
                                clearcoatRoughness={0.1}
                            />
                        </mesh>
                        {/* Brass claw foot */}
                        <mesh position={[0, -0.78, 0]}>
                            <sphereGeometry args={[0.07, 10, 8]} />
                            <meshPhysicalMaterial
                                color="#c49a3c"
                                metalness={0.9}
                                roughness={0.15}
                                clearcoat={0.7}
                                emissive="#8a6a1a"
                                emissiveIntensity={0.08}
                            />
                        </mesh>
                    </group>
                );
            })}

            {/* ══════════ TABLE APRON — Carved walnut skirt ══════════ */}
            <mesh position={[0, -0.06, 0]} receiveShadow castShadow>
                <cylinderGeometry args={[2.88, 2.98, 0.2, sides]} />
                <meshPhysicalMaterial
                    color="#1e0d06"
                    roughness={0.4}
                    metalness={0.06}
                    clearcoat={0.6}
                    clearcoatRoughness={0.12}
                />
            </mesh>

            {/* ══════════ TABLE TOP — Rich walnut slab ══════════ */}
            <mesh position={[0, 0.04, 0]} receiveShadow castShadow>
                <cylinderGeometry args={[3.15, 3.15, 0.14, sides]} />
                <meshPhysicalMaterial
                    color="#2a1408"
                    roughness={0.3}
                    metalness={0.06}
                    clearcoat={0.75}
                    clearcoatRoughness={0.08}
                />
            </mesh>

            {/* ══════════ PADDED LEATHER ARMREST RAIL ══════════ */}
            <mesh position={[0, 0.16, 0]} receiveShadow castShadow>
                <torusGeometry args={[3.08, 0.1, 16, sides]} />
                <meshPhysicalMaterial
                    color="#1a0a04"
                    roughness={0.65}
                    metalness={0.0}
                    clearcoat={0.4}
                    clearcoatRoughness={0.3}
                />
            </mesh>

            {/* ══════════ EMERALD GREEN FELT SURFACE ══════════ */}
            <mesh ref={feltRef} position={[0, 0.12, 0]} receiveShadow>
                <cylinderGeometry args={[2.88, 2.88, 0.04, sides]} />
                <meshPhysicalMaterial
                    color="#145a32"
                    roughness={0.96}
                    metalness={0}
                    clearcoat={0}
                    emissive="#082818"
                    emissiveIntensity={0.04}
                />
            </mesh>

            {/* ══════════ GOLD ARABESQUE RINGS — Intricate inlays ══════════ */}
            <group ref={arabesqueRef}>
                {/* Outer edge ring */}
                <mesh position={[0, 0.145, 0]}>
                    <torusGeometry args={[2.86, 0.025, 8, sides]} />
                    <meshPhysicalMaterial
                        color="#dab254"
                        metalness={0.92}
                        roughness={0.1}
                        clearcoat={0.9}
                        emissive="#b08820"
                        emissiveIntensity={0.12}
                    />
                </mesh>
                {/* Center decorative circle */}
                <mesh position={[0, 0.145, 0]}>
                    <torusGeometry args={[1.2, 0.018, 8, sides]} />
                    <meshPhysicalMaterial
                        color="#dab254"
                        metalness={0.88}
                        roughness={0.15}
                        clearcoat={0.8}
                        emissive="#8a6a1a"
                        emissiveIntensity={0.08}
                    />
                </mesh>
                {/* Intermediate ring */}
                <mesh position={[0, 0.145, 0]}>
                    <torusGeometry args={[2.0, 0.012, 8, sides]} />
                    <meshPhysicalMaterial
                        color="#c9a040"
                        metalness={0.85}
                        roughness={0.2}
                        clearcoat={0.7}
                        emissive="#7a5a14"
                        emissiveIntensity={0.06}
                    />
                </mesh>
            </group>

            {/* ══════════ BRASS NAIL HEAD STUDS — Around the edge ══════════ */}
            {Array.from({ length: 16 }).map((_, i) => {
                const angle = (i / 16) * Math.PI * 2;
                const sx = Math.cos(angle) * 2.96;
                const sz = Math.sin(angle) * 2.96;
                return (
                    <mesh key={`stud-${i}`} position={[sx, 0.14, sz]}>
                        <sphereGeometry args={[0.03, 8, 6]} />
                        <meshPhysicalMaterial
                            color="#c49a3c"
                            metalness={0.95}
                            roughness={0.08}
                            clearcoat={0.95}
                            emissive="#9a7420"
                            emissiveIntensity={0.15}
                        />
                    </mesh>
                );
            })}

            {/* ══════════ CENTER PLAY ZONE — Subtle ring ══════════ */}
            <mesh position={[0, 0.143, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.7, 0.75, sides]} />
                <meshPhysicalMaterial
                    color="#1a7048"
                    roughness={1}
                    metalness={0}
                    transparent
                    opacity={0.25}
                />
            </mesh>

            {/* ══════════ DRINK COASTERS — 4 brass coaster rings by each seat ══════════ */}
            {[0, 1, 2, 3].map((i) => {
                const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
                const cx = Math.cos(angle) * 2.3;
                const cz = Math.sin(angle) * 2.3;
                return (
                    <mesh key={`coaster-${i}`} position={[cx, 0.143, cz]} rotation={[-Math.PI / 2, 0, 0]}>
                        <ringGeometry args={[0.12, 0.15, 32]} />
                        <meshPhysicalMaterial
                            color="#b08820"
                            metalness={0.8}
                            roughness={0.2}
                            transparent
                            opacity={0.4}
                        />
                    </mesh>
                );
            })}
        </group>
    );
}
