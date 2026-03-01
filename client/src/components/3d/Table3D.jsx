import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Table3D() {
    const feltRef = useRef();

    // Subtle felt shimmer
    useFrame((state) => {
        if (feltRef.current) {
            feltRef.current.material.emissiveIntensity = 0.04 + Math.sin(state.clock.elapsedTime * 0.5) * 0.01;
        }
    });

    return (
        <group position={[0, 0, 0]}>
            {/* Table leg / base - Carved wood */}
            <mesh position={[0, -0.6, 0]} receiveShadow>
                <cylinderGeometry args={[0.45, 0.6, 1.2, 32]} />
                <meshPhysicalMaterial color="#1a0f08" roughness={0.6} clearcoat={0.3} clearcoatRoughness={0.4} />
            </mesh>
            <mesh position={[0, -0.1, 0]} receiveShadow>
                <cylinderGeometry args={[0.8, 0.3, 0.2, 32]} />
                <meshPhysicalMaterial color="#1f1109" roughness={0.5} clearcoat={0.4} clearcoatRoughness={0.2} />
            </mesh>

            {/* Wooden rim (outer ring) - Dark polished walnut */}
            <mesh position={[0, 0.02, 0]} receiveShadow castShadow>
                <cylinderGeometry args={[3.2, 3.2, 0.2, 64]} />
                <meshPhysicalMaterial color="#2c170a" roughness={0.3} metalness={0.1} clearcoat={0.8} clearcoatRoughness={0.1} />
            </mesh>

            {/* Inner rim carve */}
            <mesh position={[0, 0.12, 0]} receiveShadow castShadow>
                <torusGeometry args={[3.1, 0.08, 16, 64]} />
                <meshPhysicalMaterial color="#3d2110" roughness={0.4} metalness={0.1} clearcoat={0.6} clearcoatRoughness={0.2} />
            </mesh>

            {/* Green felt - Rich velvet with texture proxy */}
            <mesh ref={feltRef} position={[0, 0.15, 0]} receiveShadow>
                <cylinderGeometry args={[3.0, 3.0, 0.02, 64]} />
                <meshPhysicalMaterial
                    color="#0a2a18"
                    roughness={0.9}
                    metalness={0}
                    clearcoat={0}
                    emissive="#05140c"
                    emissiveIntensity={0.08}
                />
            </mesh>

            {/* Gold ornate trim ring around felt */}
            <mesh position={[0, 0.16, 0]}>
                <torusGeometry args={[2.98, 0.03, 16, 64]} />
                <meshPhysicalMaterial color="#c9a84c" metalness={0.9} roughness={0.2} clearcoat={0.5} emissive="#b38f36" emissiveIntensity={0.2} />
            </mesh>

            {/* Secondary Inner trim ring */}
            <mesh position={[0, 0.155, 0]}>
                <torusGeometry args={[2.8, 0.015, 16, 64]} />
                <meshPhysicalMaterial color="#c9a84c" metalness={0.8} roughness={0.3} clearcoat={0.3} emissive="#80621b" emissiveIntensity={0.1} />
            </mesh>
        </group>
    );
}
