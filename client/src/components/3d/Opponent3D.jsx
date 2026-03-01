import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

const CONFIGS = {
    1: { bodyColor: '#c9a84c', headColor: '#2c1a10', icon: '👑', name: 'Sultan' },
    2: { bodyColor: '#1b6d46', headColor: '#0a2a12', icon: '🏺', name: 'Merchant' },
    3: { bodyColor: '#8a2020', headColor: '#3a0a0a', icon: '⚔️', name: 'Berber' },
    4: { bodyColor: '#2a5aab', headColor: '#142a5b', icon: '📜', name: 'Scholar' },
};

export default function Opponent3D({ seat, position, rotation, username, team, isActive, handCount = 0 }) {
    const groupRef = useRef();
    const headRef = useRef();
    const config = CONFIGS[seat] || CONFIGS[1];

    // Idle breathing + active bounce
    useFrame((state) => {
        if (!groupRef.current) return;
        const t = state.clock.elapsedTime;

        // Breathing
        if (headRef.current) {
            headRef.current.position.y = 1.55 + Math.sin(t * 1.2 + seat) * 0.015;
            headRef.current.rotation.y = Math.sin(t * 0.4 + seat * 2) * 0.06;
        }

        // Active glow
        if (isActive) {
            groupRef.current.position.y = position[1] + Math.sin(t * 3) * 0.02;
        } else {
            groupRef.current.position.y = position[1];
        }
    });

    return (
        <group ref={groupRef} position={position} rotation={rotation || [0, 0, 0]}>
            {/* --- TORSO & DJELLABA (Traditional Robe) --- */}
            <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
                {/* A wider, flowing bottom that tapers to the shoulders */}
                <cylinderGeometry args={[0.26, 0.42, 1.1, 32]} />
                <meshPhysicalMaterial
                    color={config.bodyColor}
                    roughness={0.9}
                    metalness={0.0}
                    clearcoat={0.1}
                    clearcoatRoughness={0.8}
                />
            </mesh>

            {/* --- SHOULDERS & UPPER CHEST --- */}
            <mesh position={[0, 1.08, 0]} castShadow receiveShadow>
                <capsuleGeometry args={[0.25, 0.45, 16, 32]} rotation={[0, 0, Math.PI / 2]} />
                <meshPhysicalMaterial
                    color={config.bodyColor}
                    roughness={0.9}
                    metalness={0.0}
                    clearcoat={0.1}
                    clearcoatRoughness={0.8}
                />
            </mesh>

            {/* --- LEFT ARM (Sleeve) --- */}
            <group position={[-0.38, 1.0, 0]} rotation={[0, 0.1, 0.3]}>
                <mesh position={[0, -0.35, 0]} castShadow receiveShadow>
                    <cylinderGeometry args={[0.08, 0.14, 0.7, 16]} />
                    <meshPhysicalMaterial color={config.bodyColor} roughness={0.9} metalness={0.0} clearcoat={0.1} clearcoatRoughness={0.8} />
                </mesh>
                {/* Hand emerging from sleeve */}
                <mesh position={[0, -0.75, 0]} castShadow receiveShadow>
                    <boxGeometry args={[0.08, 0.12, 0.05]} />
                    <meshPhysicalMaterial color={config.headColor} roughness={0.4} metalness={0.1} clearcoat={0.2} clearcoatRoughness={0.3} emissive={config.headColor} emissiveIntensity={0.05} />
                </mesh>
            </group>

            {/* --- RIGHT ARM (Sleeve) --- */}
            <group position={[0.38, 1.0, 0]} rotation={[0, -0.1, -0.3]}>
                <mesh position={[0, -0.35, 0]} castShadow receiveShadow>
                    <cylinderGeometry args={[0.08, 0.14, 0.7, 16]} />
                    <meshPhysicalMaterial color={config.bodyColor} roughness={0.9} metalness={0.0} clearcoat={0.1} clearcoatRoughness={0.8} />
                </mesh>
                {/* Hand sitting on table */}
                <mesh position={[0, -0.75, 0.05]} rotation={[-0.2, 0, 0]} castShadow receiveShadow>
                    <boxGeometry args={[0.08, 0.12, 0.05]} />
                    <meshPhysicalMaterial color={config.headColor} roughness={0.4} metalness={0.1} clearcoat={0.2} clearcoatRoughness={0.3} emissive={config.headColor} emissiveIntensity={0.05} />
                </mesh>
            </group>

            {/* --- NECK --- */}
            <mesh position={[0, 1.25, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.07, 0.09, 0.15, 16]} />
                <meshPhysicalMaterial color={config.headColor} roughness={0.4} metalness={0.1} clearcoat={0.2} clearcoatRoughness={0.3} emissive={config.headColor} emissiveIntensity={0.05} />
            </mesh>

            {/* --- HEAD & FACE --- */}
            <group ref={headRef} position={[0, 1.45, 0]}>
                {/* Main Head Base */}
                <mesh castShadow receiveShadow>
                    <sphereGeometry args={[0.18, 32, 32]} />
                    <meshPhysicalMaterial color={config.headColor} roughness={0.4} metalness={0.1} clearcoat={0.3} clearcoatRoughness={0.2} emissive={config.headColor} emissiveIntensity={0.05} />
                </mesh>

                {/* Brow Ridge */}
                <mesh position={[0, 0.05, 0.14]} castShadow renderOrder={2}>
                    <capsuleGeometry args={[0.03, 0.15, 8, 16]} rotation={[0, 0, Math.PI / 2]} />
                    <meshPhysicalMaterial color={config.headColor} roughness={0.4} clearcoat={0.3} clearcoatRoughness={0.2} />
                </mesh>

                {/* Nose */}
                <mesh position={[0, -0.01, 0.18]} rotation={[0.4, 0, 0]} castShadow renderOrder={2}>
                    <coneGeometry args={[0.03, 0.08, 16]} />
                    <meshPhysicalMaterial color={config.headColor} roughness={0.3} metalness={0.1} clearcoat={0.4} clearcoatRoughness={0.1} />
                </mesh>

                {/* Thick Traditional Beard */}
                <mesh position={[0, -0.12, 0.12]} castShadow receiveShadow>
                    <sphereGeometry args={[0.13, 16, 16]} />
                    <meshPhysicalMaterial color="#111111" roughness={0.9} metalness={0.0} clearcoat={0.05} clearcoatRoughness={1.0} />
                </mesh>
                {/* Mustache overlapping beard */}
                <mesh position={[0, -0.05, 0.18]} castShadow>
                    <capsuleGeometry args={[0.02, 0.1, 8, 16]} rotation={[0, 0, Math.PI / 2]} />
                    <meshPhysicalMaterial color="#111111" roughness={0.9} />
                </mesh>

                {/* Eyes - Deep-set and highly realistic glow logic */}
                <mesh position={[-0.07, 0.03, 0.14]}>
                    <sphereGeometry args={[0.015, 16, 16]} />
                    <meshPhysicalMaterial
                        color={isActive ? '#ffe499' : '#1a1a1a'}
                        emissive={isActive ? '#d9a02e' : '#000000'}
                        emissiveIntensity={isActive ? 2.5 : 0}
                        roughness={0.1}
                        clearcoat={1.0}
                        clearcoatRoughness={0.0}
                    />
                </mesh>
                <mesh position={[0.07, 0.03, 0.14]}>
                    <sphereGeometry args={[0.015, 16, 16]} />
                    <meshPhysicalMaterial
                        color={isActive ? '#ffe499' : '#1a1a1a'}
                        emissive={isActive ? '#d9a02e' : '#000000'}
                        emissiveIntensity={isActive ? 2.5 : 0}
                        roughness={0.1}
                        clearcoat={1.0}
                        clearcoatRoughness={0.0}
                    />
                </mesh>

                {/* --- HEADWEAR --- */}
                {/* Turban Wrap / Tarbouche depending on seat */}
                {seat === 1 || seat === 3 ? (
                    // Turban for Seats 1 & 3
                    <group position={[0, 0.12, 0]} rotation={[-0.1, 0, 0]}>
                        <mesh castShadow receiveShadow>
                            {/* Base wrap */}
                            <torusGeometry args={[0.17, 0.07, 16, 64]} />
                            <meshPhysicalMaterial color="#e6dfcc" roughness={0.9} clearcoat={0.1} clearcoatRoughness={0.9} />
                        </mesh>
                        <mesh position={[0, 0.05, 0]} rotation={[0.2, 0, 0.1]} castShadow receiveShadow>
                            {/* Layered wrap */}
                            <torusGeometry args={[0.15, 0.06, 16, 64]} />
                            <meshPhysicalMaterial color="#d4cbb8" roughness={0.9} clearcoat={0.1} clearcoatRoughness={0.9} />
                        </mesh>
                    </group>
                ) : (
                    // Fez / Tarbouche for Seats 2 & 4
                    <group position={[0, 0.15, -0.04]} rotation={[-0.2, 0, 0]}>
                        <mesh castShadow receiveShadow>
                            <cylinderGeometry args={[0.14, 0.16, 0.25, 32]} />
                            <meshPhysicalMaterial color="#8a1c1c" roughness={0.8} clearcoat={0.2} clearcoatRoughness={0.5} />
                        </mesh>
                        {/* Fez Tassel */}
                        <mesh position={[0, 0.12, 0]} castShadow>
                            <cylinderGeometry args={[0.005, 0.005, 0.05]} />
                            <meshPhysicalMaterial color="#000000" roughness={0.8} />
                        </mesh>
                        <mesh position={[0.04, 0.05, 0]} rotation={[0, 0, -0.4]} castShadow>
                            <cylinderGeometry args={[0.01, 0.015, 0.15, 8]} />
                            <meshPhysicalMaterial color="#000000" roughness={0.8} />
                        </mesh>
                    </group>
                )}
            </group>

            {/* Active turn indicator - Deep ornate glowing ring on table */}
            {isActive && (
                <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.35, 0.5, 32]} />
                    <meshBasicMaterial color="#c9a84c" transparent opacity={0.3} side={THREE.DoubleSide} />
                </mesh>
            )}

            {/* Face-down cards in front of character */}
            {Array.from({ length: handCount }).map((_, i) => (
                <mesh
                    key={i}
                    position={[(i - (handCount - 1) / 2) * 0.12, 0.16, 0.6 + i * 0.005]}
                    rotation={[-Math.PI / 2, 0, (i - (handCount - 1) / 2) * 0.08]}
                    castShadow
                >
                    <planeGeometry args={[0.25, 0.36]} />
                    <meshStandardMaterial color="#3a0808" roughness={0.8} />
                </mesh>
            ))}

            {/* Name label */}
            <Html position={[0, 2.0, 0]} center style={{ pointerEvents: 'none' }}>
                <div style={{
                    background: 'rgba(10, 15, 12, 0.9)',
                    border: `1px solid ${config.bodyColor}`,
                    borderRadius: '12px',
                    padding: '3px 12px',
                    fontSize: '10px',
                    fontWeight: 700,
                    color: config.bodyColor,
                    fontFamily: 'Outfit, sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '1.5px',
                    whiteSpace: 'nowrap',
                    textAlign: 'center',
                    backdropFilter: 'blur(4px)',
                }}>
                    {username || config.name}
                    <span style={{ marginLeft: 6, opacity: 0.5, fontSize: '8px' }}>
                        {team === 'A' ? '🔵' : '🟠'}
                    </span>
                </div>
            </Html>

            {/* Tea glass */}
            <group position={[0.5, 0.15, 0.4]}>
                {/* Glass */}
                <mesh>
                    <cylinderGeometry args={[0.04, 0.05, 0.12, 8]} />
                    <meshStandardMaterial color="#7ab848" transparent opacity={0.5} roughness={0.2} metalness={0.3} />
                </mesh>
                {/* Tea */}
                <mesh position={[0, 0.03, 0]}>
                    <cylinderGeometry args={[0.035, 0.035, 0.04, 8]} />
                    <meshStandardMaterial color="#4a8020" roughness={0.6} />
                </mesh>
            </group>
        </group>
    );
}
