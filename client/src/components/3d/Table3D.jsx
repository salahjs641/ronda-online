import React from 'react';
import * as THREE from 'three';

/**
 * Clean Green Table
 * A simple table with a green felt surface and wooden rim
 */
export default function Table3D() {
    const seg = 48;

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

            {/* ══════════ TABLE TOP BASE ══════════ */}
            <mesh position={[0, 0.04, 0]} receiveShadow castShadow>
                <cylinderGeometry args={[2.95, 2.95, 0.1, seg]} />
                <meshPhysicalMaterial
                    color="#2a2a2a"
                    roughness={0.85}
                    metalness={0.02}
                />
            </mesh>

            {/* ══════════ GREEN FELT SURFACE ══════════ */}
            <mesh position={[0, 0.1, 0]} receiveShadow>
                <cylinderGeometry args={[2.75, 2.75, 0.03, seg]} />
                <meshPhysicalMaterial
                    color="#1a5a32"
                    roughness={0.9}
                    metalness={0.1}
                    clearcoat={0.0}
                />
            </mesh>

            {/* ══════════ WOOD RIM ══════════ */}
            <mesh position={[0, 0.116, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow>
                <ringGeometry args={[2.75, 2.95, seg]} />
                <meshPhysicalMaterial
                    color="#4a3018"
                    roughness={0.7}
                    metalness={0.05}
                />
            </mesh>

        </group>
    );
}
