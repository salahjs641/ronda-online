import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Stylized Moroccan player figurines — clean, elegant game-piece style.
 * Think chess pawns meets Moroccan craft — smooth curves, rich colors,
 * no uncanny-valley faces. Each seat has a unique djellaba color and hat style.
 */

const CONFIGS = {
    1: { primary: '#c9a84c', secondary: '#a07c28', hat: 'chechia', team: 'Sultan' },
    2: { primary: '#1a7050', secondary: '#0e4a32', hat: 'turban', team: 'Merchant' },
    3: { primary: '#8b2020', secondary: '#5a1010', hat: 'chechia', team: 'Warrior' },
    4: { primary: '#2a5a9a', secondary: '#1a3a6a', hat: 'turban', team: 'Scholar' },
};

const SKIN = '#c08050';

export default function Opponent3D({ seat, position, rotation, username, team, isActive, handCount = 0 }) {
    const groupRef = useRef();
    const bodyRef = useRef();
    const config = CONFIGS[seat] || CONFIGS[1];

    useFrame((state) => {
        if (!groupRef.current) return;
        const t = state.clock.elapsedTime;

        // Gentle idle sway — like a person breathing
        if (bodyRef.current) {
            bodyRef.current.rotation.z = Math.sin(t * 0.8 + seat * 1.5) * 0.015;
            bodyRef.current.position.y = Math.sin(t * 1.2 + seat) * 0.008;
        }

        // Active pulse
        if (isActive) {
            groupRef.current.position.y = position[1] + Math.sin(t * 2) * 0.02;
        } else {
            groupRef.current.position.y = position[1];
        }
    });

    return (
        <group ref={groupRef} position={position} rotation={rotation || [0, 0, 0]}>
            <group ref={bodyRef}>

                {/* ═══ BASE / ROBE — Smooth flowing djellaba shape ═══ */}
                <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
                    <cylinderGeometry args={[0.22, 0.45, 1.0, 32]} />
                    <meshPhysicalMaterial
                        color={config.primary}
                        roughness={0.8}
                        metalness={0.02}
                        clearcoat={0.15}
                    />
                </mesh>

                {/* Robe mid-section — slightly narrower */}
                <mesh position={[0, 0.95, 0]} castShadow receiveShadow>
                    <cylinderGeometry args={[0.2, 0.24, 0.3, 32]} />
                    <meshPhysicalMaterial
                        color={config.secondary}
                        roughness={0.8}
                        metalness={0.02}
                        clearcoat={0.15}
                    />
                </mesh>

                {/* ═══ GOLD EMBROIDERY BAND — Around the chest ═══ */}
                <mesh position={[0, 0.82, 0]}>
                    <torusGeometry args={[0.23, 0.015, 6, 32]} />
                    <meshPhysicalMaterial
                        color="#d4a84c"
                        metalness={0.85}
                        roughness={0.15}
                        emissive="#8a6a1a"
                        emissiveIntensity={0.1}
                    />
                </mesh>

                {/* ═══ NECK ═══ */}
                <mesh position={[0, 1.12, 0]} castShadow>
                    <cylinderGeometry args={[0.06, 0.08, 0.08, 16]} />
                    <meshPhysicalMaterial
                        color={SKIN}
                        roughness={0.55}
                        clearcoat={0.3}
                    />
                </mesh>

                {/* ═══ HEAD — Smooth sphere, no face details ═══ */}
                <mesh position={[0, 1.3, 0]} castShadow receiveShadow>
                    <sphereGeometry args={[0.16, 32, 24]} />
                    <meshPhysicalMaterial
                        color={SKIN}
                        roughness={0.5}
                        metalness={0.03}
                        clearcoat={0.35}
                        clearcoatRoughness={0.2}
                    />
                </mesh>

                {/* ═══ HEADWEAR ═══ */}
                {config.hat === 'chechia' ? (
                    /* Moroccan Chechia / Fez — iconic red cap */
                    <group position={[0, 1.42, 0]}>
                        <mesh castShadow receiveShadow>
                            <cylinderGeometry args={[0.1, 0.13, 0.18, 24]} />
                            <meshPhysicalMaterial
                                color="#9a1818"
                                roughness={0.7}
                                clearcoat={0.25}
                            />
                        </mesh>
                        {/* Flat top */}
                        <mesh position={[0, 0.09, 0]}>
                            <cylinderGeometry args={[0.1, 0.1, 0.01, 24]} />
                            <meshPhysicalMaterial color="#9a1818" roughness={0.7} clearcoat={0.25} />
                        </mesh>
                        {/* Silk tassel */}
                        <mesh position={[0.08, 0.04, 0]} rotation={[0, 0, -0.6]}>
                            <cylinderGeometry args={[0.005, 0.01, 0.12, 6]} />
                            <meshPhysicalMaterial color="#111" roughness={0.85} />
                        </mesh>
                        <mesh position={[0.12, -0.02, 0]}>
                            <sphereGeometry args={[0.018, 8, 6]} />
                            <meshPhysicalMaterial color="#111" roughness={0.9} />
                        </mesh>
                    </group>
                ) : (
                    /* White turban wrap */
                    <group position={[0, 1.42, 0]}>
                        <mesh castShadow receiveShadow>
                            <torusGeometry args={[0.14, 0.055, 12, 32]} />
                            <meshPhysicalMaterial
                                color="#f0ece0"
                                roughness={0.85}
                                clearcoat={0.08}
                            />
                        </mesh>
                        <mesh position={[0, 0.04, 0]} rotation={[0.1, 0.2, 0]}>
                            <torusGeometry args={[0.12, 0.045, 12, 32]} />
                            <meshPhysicalMaterial
                                color="#e8e0d0"
                                roughness={0.85}
                                clearcoat={0.08}
                            />
                        </mesh>
                        <mesh position={[0, 0.07, 0]}>
                            <sphereGeometry args={[0.05, 12, 8]} />
                            <meshPhysicalMaterial color="#f0ece0" roughness={0.85} />
                        </mesh>
                    </group>
                )}

                {/* ═══ ARMS — Simple rounded shapes resting forward ═══ */}
                {[-1, 1].map((side) => (
                    <group key={`arm-${side}`} position={[side * 0.28, 0.85, 0.1]} rotation={[0.4, 0, side * 0.3]}>
                        <mesh position={[0, -0.2, 0]} castShadow>
                            <capsuleGeometry args={[0.05, 0.35, 8, 12]} />
                            <meshPhysicalMaterial
                                color={config.primary}
                                roughness={0.8}
                                clearcoat={0.15}
                            />
                        </mesh>
                        {/* Hand */}
                        <mesh position={[0, -0.42, 0]}>
                            <sphereGeometry args={[0.04, 10, 8]} />
                            <meshPhysicalMaterial color={SKIN} roughness={0.55} clearcoat={0.3} />
                        </mesh>
                    </group>
                ))}
            </group>

            {/* ═══ ACTIVE INDICATOR — Glowing golden ring ═══ */}
            {isActive && (
                <group position={[0, 0.02, 0]}>
                    <mesh rotation={[-Math.PI / 2, 0, 0]}>
                        <ringGeometry args={[0.5, 0.58, 48]} />
                        <meshBasicMaterial
                            color="#d4a84c"
                            transparent
                            opacity={0.4}
                            side={THREE.DoubleSide}
                        />
                    </mesh>
                    <pointLight
                        position={[0, 0.3, 0]}
                        intensity={0.8}
                        color="#ffd700"
                        distance={1.5}
                        decay={2}
                    />
                </group>
            )}

            {/* ═══ FACE-DOWN CARDS ═══ */}
            {Array.from({ length: handCount }).map((_, i) => (
                <mesh
                    key={i}
                    position={[(i - (handCount - 1) / 2) * 0.13, 0.15, 0.6 + i * 0.003]}
                    rotation={[-Math.PI / 2, 0, (i - (handCount - 1) / 2) * 0.06]}
                    castShadow
                >
                    <planeGeometry args={[0.22, 0.32]} />
                    <meshPhysicalMaterial
                        color="#4a1010"
                        roughness={0.65}
                        metalness={0.05}
                        clearcoat={0.3}
                    />
                </mesh>
            ))}

            {/* ═══ NAME LABEL ═══ */}
            <Html position={[0, 1.85, 0]} center style={{ pointerEvents: 'none' }}>
                <div style={{
                    background: isActive
                        ? 'rgba(212, 168, 76, 0.15)'
                        : 'rgba(0, 0, 0, 0.7)',
                    border: `1px solid ${isActive ? '#d4a84c' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '20px',
                    padding: '3px 14px',
                    fontSize: '10px',
                    fontWeight: 700,
                    color: isActive ? '#ffd700' : '#ccc',
                    fontFamily: 'Outfit, sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    whiteSpace: 'nowrap',
                    textAlign: 'center',
                    backdropFilter: 'blur(8px)',
                    boxShadow: isActive ? '0 0 15px rgba(212, 168, 76, 0.3)' : 'none',
                }}>
                    {username || config.team}
                    <span style={{ marginLeft: 8, fontSize: '8px', opacity: 0.5 }}>
                        {team === 'A' ? '🔵' : '🟠'}
                    </span>
                </div>
            </Html>

            {/* ═══ MINT TEA GLASS — Traditional Moroccan tea ═══ */}
            <group position={[0.48, 0.12, 0.35]}>
                <mesh>
                    <cylinderGeometry args={[0.025, 0.035, 0.08, 8]} />
                    <meshPhysicalMaterial
                        color="#ffffff"
                        roughness={0.05}
                        metalness={0.1}
                        clearcoat={1.0}
                        transparent
                        opacity={0.4}
                    />
                </mesh>
                {/* Tea inside */}
                <mesh position={[0, 0.01, 0]}>
                    <cylinderGeometry args={[0.02, 0.025, 0.03, 8]} />
                    <meshPhysicalMaterial
                        color="#7a9a30"
                        roughness={0.4}
                        transparent
                        opacity={0.7}
                    />
                </mesh>
                {/* Gold rim */}
                <mesh position={[0, 0.04, 0]}>
                    <torusGeometry args={[0.025, 0.003, 4, 12]} />
                    <meshPhysicalMaterial
                        color="#d4a84c"
                        metalness={0.9}
                        roughness={0.1}
                    />
                </mesh>
            </group>
        </group>
    );
}
