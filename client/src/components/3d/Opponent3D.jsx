import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

const CONFIGS = {
    1: {
        robeColor: '#d4af37', robeAccent: '#b8941e', skinColor: '#c68642',
        turbanColor: '#f5f0e0', icon: '👑', name: 'Sultan', headwear: 'turban'
    },
    2: {
        robeColor: '#1a6b47', robeAccent: '#0f4f32', skinColor: '#a0714a',
        turbanColor: '#8b1a1a', icon: '🏺', name: 'Merchant', headwear: 'fez'
    },
    3: {
        robeColor: '#6b1a1a', robeAccent: '#4a0e0e', skinColor: '#8d5524',
        turbanColor: '#d8cfc0', icon: '⚔️', name: 'Warrior', headwear: 'turban'
    },
    4: {
        robeColor: '#2a4a8a', robeAccent: '#1a3060', skinColor: '#b57840',
        turbanColor: '#8b1a1a', icon: '📜', name: 'Scholar', headwear: 'fez'
    },
};

export default function Opponent3D({ seat, position, rotation, username, team, isActive, handCount = 0 }) {
    const groupRef = useRef();
    const headRef = useRef();
    const breathRef = useRef();
    const config = CONFIGS[seat] || CONFIGS[1];

    useFrame((state) => {
        if (!groupRef.current) return;
        const t = state.clock.elapsedTime;

        // Breathing sway
        if (breathRef.current) {
            breathRef.current.scale.x = 1 + Math.sin(t * 1.0 + seat) * 0.008;
            breathRef.current.scale.z = 1 + Math.sin(t * 1.0 + seat + 0.5) * 0.008;
        }

        // Head bob + idle look
        if (headRef.current) {
            headRef.current.position.y = 1.52 + Math.sin(t * 1.1 + seat) * 0.012;
            headRef.current.rotation.y = Math.sin(t * 0.35 + seat * 1.5) * 0.05;
            headRef.current.rotation.z = Math.sin(t * 0.5 + seat) * 0.015;
        }

        // Active bounce
        if (isActive) {
            groupRef.current.position.y = position[1] + Math.sin(t * 2.5) * 0.015;
        } else {
            groupRef.current.position.y = position[1];
        }
    });

    return (
        <group ref={groupRef} position={position} rotation={rotation || [0, 0, 0]}>

            {/* ═══ LOWER ROBE — Flowing djellaba skirt ═══ */}
            <mesh ref={breathRef} position={[0, 0.35, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.3, 0.48, 0.8, 24]} />
                <meshPhysicalMaterial
                    color={config.robeColor}
                    roughness={0.85}
                    metalness={0.02}
                    clearcoat={0.15}
                    clearcoatRoughness={0.7}
                />
            </mesh>

            {/* ═══ ROBE BELT / SASH ═══ */}
            <mesh position={[0, 0.75, 0]} castShadow>
                <torusGeometry args={[0.28, 0.025, 8, 32]} />
                <meshPhysicalMaterial
                    color="#c49a3c"
                    metalness={0.85}
                    roughness={0.15}
                    clearcoat={0.8}
                    emissive="#8a6a1a"
                    emissiveIntensity={0.1}
                />
            </mesh>

            {/* ═══ UPPER TORSO — Fitted robe top ═══ */}
            <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.28, 0.30, 0.5, 24]} />
                <meshPhysicalMaterial
                    color={config.robeAccent}
                    roughness={0.82}
                    metalness={0.02}
                    clearcoat={0.15}
                    clearcoatRoughness={0.7}
                />
            </mesh>

            {/* ═══ SHOULDERS — Broad shape ═══ */}
            <mesh position={[0, 1.12, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
                <capsuleGeometry args={[0.14, 0.42, 12, 24]} />
                <meshPhysicalMaterial
                    color={config.robeColor}
                    roughness={0.85}
                    metalness={0.02}
                    clearcoat={0.15}
                    clearcoatRoughness={0.7}
                />
            </mesh>

            {/* ═══ COLLAR / NECKLINE — V-shaped decorative ═══ */}
            <mesh position={[0, 1.18, 0.12]} rotation={[0.3, 0, 0]} castShadow>
                <boxGeometry args={[0.12, 0.08, 0.02]} />
                <meshPhysicalMaterial
                    color="#dab254"
                    metalness={0.8}
                    roughness={0.2}
                    clearcoat={0.7}
                    emissive="#8a6a1a"
                    emissiveIntensity={0.08}
                />
            </mesh>

            {/* ═══ LEFT ARM ═══ */}
            <group position={[-0.36, 1.05, 0]} rotation={[0.15, 0.1, 0.35]}>
                {/* Upper sleeve */}
                <mesh position={[0, -0.2, 0]} castShadow receiveShadow>
                    <cylinderGeometry args={[0.09, 0.12, 0.4, 12]} />
                    <meshPhysicalMaterial color={config.robeColor} roughness={0.85} clearcoat={0.15} />
                </mesh>
                {/* Forearm / wider sleeve opening */}
                <mesh position={[0, -0.5, 0]} castShadow receiveShadow>
                    <cylinderGeometry args={[0.06, 0.14, 0.35, 12]} />
                    <meshPhysicalMaterial color={config.robeAccent} roughness={0.85} clearcoat={0.15} />
                </mesh>
                {/* Hand */}
                <mesh position={[0, -0.72, 0]} castShadow>
                    <sphereGeometry args={[0.045, 12, 10]} />
                    <meshPhysicalMaterial
                        color={config.skinColor}
                        roughness={0.55}
                        metalness={0.05}
                        clearcoat={0.25}
                        clearcoatRoughness={0.3}
                    />
                </mesh>
            </group>

            {/* ═══ RIGHT ARM ═══ */}
            <group position={[0.36, 1.05, 0]} rotation={[0.15, -0.1, -0.35]}>
                <mesh position={[0, -0.2, 0]} castShadow receiveShadow>
                    <cylinderGeometry args={[0.09, 0.12, 0.4, 12]} />
                    <meshPhysicalMaterial color={config.robeColor} roughness={0.85} clearcoat={0.15} />
                </mesh>
                <mesh position={[0, -0.5, 0]} castShadow receiveShadow>
                    <cylinderGeometry args={[0.06, 0.14, 0.35, 12]} />
                    <meshPhysicalMaterial color={config.robeAccent} roughness={0.85} clearcoat={0.15} />
                </mesh>
                <mesh position={[0, -0.72, 0.06]} rotation={[-0.3, 0, 0]} castShadow>
                    <sphereGeometry args={[0.045, 12, 10]} />
                    <meshPhysicalMaterial
                        color={config.skinColor}
                        roughness={0.55}
                        metalness={0.05}
                        clearcoat={0.25}
                        clearcoatRoughness={0.3}
                    />
                </mesh>
            </group>

            {/* ═══ NECK ═══ */}
            <mesh position={[0, 1.28, 0]} castShadow>
                <cylinderGeometry args={[0.065, 0.08, 0.12, 16]} />
                <meshPhysicalMaterial
                    color={config.skinColor}
                    roughness={0.5}
                    metalness={0.05}
                    clearcoat={0.3}
                    clearcoatRoughness={0.25}
                />
            </mesh>

            {/* ═══ HEAD & FACE ═══ */}
            <group ref={headRef} position={[0, 1.45, 0]}>
                {/* Skull */}
                <mesh castShadow receiveShadow>
                    <sphereGeometry args={[0.17, 32, 24]} />
                    <meshPhysicalMaterial
                        color={config.skinColor}
                        roughness={0.5}
                        metalness={0.05}
                        clearcoat={0.35}
                        clearcoatRoughness={0.2}
                    />
                </mesh>

                {/* Jaw / chin structure */}
                <mesh position={[0, -0.08, 0.04]} castShadow>
                    <boxGeometry args={[0.14, 0.08, 0.12]} />
                    <meshPhysicalMaterial
                        color={config.skinColor}
                        roughness={0.5}
                        clearcoat={0.3}
                    />
                </mesh>

                {/* Ears */}
                {[-1, 1].map((side) => (
                    <mesh key={`ear-${side}`} position={[side * 0.17, 0, 0]} castShadow>
                        <sphereGeometry args={[0.035, 8, 6]} />
                        <meshPhysicalMaterial color={config.skinColor} roughness={0.5} clearcoat={0.3} />
                    </mesh>
                ))}

                {/* Brow ridge */}
                <mesh position={[0, 0.055, 0.145]} rotation={[0, 0, Math.PI / 2]} castShadow>
                    <capsuleGeometry args={[0.022, 0.11, 8, 12]} />
                    <meshPhysicalMaterial color={config.skinColor} roughness={0.5} clearcoat={0.3} />
                </mesh>

                {/* Nose */}
                <mesh position={[0, -0.01, 0.17]} rotation={[0.3, 0, 0]} castShadow>
                    <coneGeometry args={[0.025, 0.07, 12]} />
                    <meshPhysicalMaterial color={config.skinColor} roughness={0.45} clearcoat={0.4} />
                </mesh>

                {/* Eyes — glow when active */}
                {[-0.065, 0.065].map((x, idx) => (
                    <group key={`eye-${idx}`} position={[x, 0.035, 0.145]}>
                        {/* White of eye */}
                        <mesh>
                            <sphereGeometry args={[0.02, 12, 10]} />
                            <meshPhysicalMaterial
                                color="#f0f0f0"
                                roughness={0.1}
                                clearcoat={1.0}
                            />
                        </mesh>
                        {/* Iris */}
                        <mesh position={[0, 0, 0.01]}>
                            <sphereGeometry args={[0.012, 10, 8]} />
                            <meshPhysicalMaterial
                                color={isActive ? '#d9a02e' : '#2a1a0a'}
                                emissive={isActive ? '#ffcc44' : '#000000'}
                                emissiveIntensity={isActive ? 3.0 : 0}
                                roughness={0.05}
                                clearcoat={1.0}
                            />
                        </mesh>
                        {/* Pupil */}
                        <mesh position={[0, 0, 0.018]}>
                            <sphereGeometry args={[0.006, 8, 6]} />
                            <meshPhysicalMaterial color="#000000" roughness={0.1} clearcoat={1.0} />
                        </mesh>
                    </group>
                ))}

                {/* Thick beard */}
                <mesh position={[0, -0.12, 0.1]} castShadow>
                    <sphereGeometry args={[0.12, 16, 12]} />
                    <meshPhysicalMaterial
                        color="#1a1008"
                        roughness={0.95}
                        metalness={0}
                        clearcoat={0.05}
                    />
                </mesh>

                {/* Mustache */}
                <mesh position={[0, -0.04, 0.16]} rotation={[0, 0, Math.PI / 2]} castShadow>
                    <capsuleGeometry args={[0.018, 0.08, 6, 12]} />
                    <meshPhysicalMaterial color="#1a1008" roughness={0.95} />
                </mesh>

                {/* ═══ HEADWEAR ═══ */}
                {config.headwear === 'turban' ? (
                    <group position={[0, 0.12, 0]} rotation={[-0.08, 0, 0]}>
                        {/* Base wrap */}
                        <mesh castShadow receiveShadow>
                            <torusGeometry args={[0.16, 0.065, 16, 48]} />
                            <meshPhysicalMaterial
                                color={config.turbanColor}
                                roughness={0.88}
                                clearcoat={0.1}
                            />
                        </mesh>
                        {/* Second layer */}
                        <mesh position={[0, 0.05, 0]} rotation={[0.15, 0.3, 0.08]} castShadow>
                            <torusGeometry args={[0.14, 0.055, 16, 48]} />
                            <meshPhysicalMaterial
                                color={config.turbanColor}
                                roughness={0.88}
                                clearcoat={0.1}
                            />
                        </mesh>
                        {/* Top knot */}
                        <mesh position={[0, 0.09, 0]} castShadow>
                            <sphereGeometry args={[0.06, 12, 10]} />
                            <meshPhysicalMaterial
                                color={config.turbanColor}
                                roughness={0.88}
                            />
                        </mesh>
                        {/* Gold brooch on turban */}
                        <mesh position={[0, 0.05, 0.15]} castShadow>
                            <octahedronGeometry args={[0.025, 0]} />
                            <meshPhysicalMaterial
                                color="#d4af37"
                                metalness={0.95}
                                roughness={0.08}
                                clearcoat={1.0}
                                emissive="#b08820"
                                emissiveIntensity={0.2}
                            />
                        </mesh>
                    </group>
                ) : (
                    <group position={[0, 0.14, -0.03]} rotation={[-0.15, 0, 0]}>
                        {/* Fez body */}
                        <mesh castShadow receiveShadow>
                            <cylinderGeometry args={[0.12, 0.145, 0.22, 24]} />
                            <meshPhysicalMaterial
                                color={config.turbanColor}
                                roughness={0.75}
                                clearcoat={0.25}
                                clearcoatRoughness={0.4}
                            />
                        </mesh>
                        {/* Flat top */}
                        <mesh position={[0, 0.11, 0]} rotation={[0, 0, 0]} castShadow>
                            <cylinderGeometry args={[0.12, 0.12, 0.01, 24]} />
                            <meshPhysicalMaterial color={config.turbanColor} roughness={0.75} clearcoat={0.25} />
                        </mesh>
                        {/* Tassel anchor */}
                        <mesh position={[0, 0.11, 0]} castShadow>
                            <sphereGeometry args={[0.015, 8, 6]} />
                            <meshPhysicalMaterial color="#111" roughness={0.8} />
                        </mesh>
                        {/* Tassel string */}
                        <mesh position={[0.06, 0.06, 0]} rotation={[0, 0, -0.5]} castShadow>
                            <cylinderGeometry args={[0.006, 0.008, 0.14, 6]} />
                            <meshPhysicalMaterial color="#111" roughness={0.8} />
                        </mesh>
                        {/* Tassel tuft */}
                        <mesh position={[0.1, 0, 0]} castShadow>
                            <sphereGeometry args={[0.02, 8, 6]} />
                            <meshPhysicalMaterial color="#111" roughness={0.9} />
                        </mesh>
                    </group>
                )}
            </group>

            {/* ═══ ACTIVE TURN INDICATOR — Golden aura ring ═══ */}
            {isActive && (
                <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.4, 0.55, 48]} />
                    <meshBasicMaterial
                        color="#d4af37"
                        transparent
                        opacity={0.35}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            )}

            {/* ═══ FACE-DOWN CARDS in front ═══ */}
            {Array.from({ length: handCount }).map((_, i) => (
                <mesh
                    key={i}
                    position={[(i - (handCount - 1) / 2) * 0.13, 0.16, 0.65 + i * 0.004]}
                    rotation={[-Math.PI / 2, 0, (i - (handCount - 1) / 2) * 0.07]}
                    castShadow
                >
                    <planeGeometry args={[0.22, 0.33]} />
                    <meshPhysicalMaterial
                        color="#4a0a0a"
                        roughness={0.7}
                        metalness={0.05}
                        clearcoat={0.3}
                    />
                </mesh>
            ))}

            {/* ═══ NAME LABEL ═══ */}
            <Html position={[0, 2.05, 0]} center style={{ pointerEvents: 'none' }}>
                <div style={{
                    background: isActive
                        ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.25), rgba(10, 15, 12, 0.9))'
                        : 'rgba(10, 15, 12, 0.88)',
                    border: `1px solid ${isActive ? '#d4af37' : config.robeColor + '80'}`,
                    borderRadius: '16px',
                    padding: '4px 14px',
                    fontSize: '10px',
                    fontWeight: 700,
                    color: isActive ? '#ffd700' : config.robeColor,
                    fontFamily: 'Outfit, sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    whiteSpace: 'nowrap',
                    textAlign: 'center',
                    backdropFilter: 'blur(6px)',
                    boxShadow: isActive
                        ? '0 0 20px rgba(212, 175, 55, 0.3)'
                        : '0 4px 12px rgba(0,0,0,0.5)',
                    transition: 'all 0.4s ease',
                }}>
                    {username || config.name}
                    <span style={{
                        marginLeft: 8,
                        fontSize: '9px',
                        opacity: 0.6,
                    }}>
                        {team === 'A' ? '🔵' : '🟠'}
                    </span>
                </div>
            </Html>

            {/* ═══ MOROCCAN TEA GLASS ═══ */}
            <group position={[0.55, 0.13, 0.35]}>
                {/* Glass body — ornate */}
                <mesh>
                    <cylinderGeometry args={[0.03, 0.045, 0.1, 12]} />
                    <meshPhysicalMaterial
                        color="#d4af37"
                        metalness={0.6}
                        roughness={0.15}
                        clearcoat={0.9}
                        transparent
                        opacity={0.7}
                    />
                </mesh>
                {/* Tea liquid */}
                <mesh position={[0, 0.02, 0]}>
                    <cylinderGeometry args={[0.025, 0.03, 0.04, 12]} />
                    <meshPhysicalMaterial
                        color="#8b5e2a"
                        roughness={0.3}
                        clearcoat={0.5}
                        transparent
                        opacity={0.8}
                    />
                </mesh>
                {/* Gold rim band */}
                <mesh position={[0, 0.05, 0]}>
                    <torusGeometry args={[0.030, 0.004, 6, 16]} />
                    <meshPhysicalMaterial
                        color="#d4af37"
                        metalness={0.9}
                        roughness={0.1}
                        emissive="#8a6a1a"
                        emissiveIntensity={0.1}
                    />
                </mesh>
            </group>
        </group>
    );
}
