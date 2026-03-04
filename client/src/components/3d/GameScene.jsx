import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import Table3D from './Table3D';
import Hand3D from './Hand3D';
import TableCards3D from './TableCards3D';
import Opponent3D from './Opponent3D';
import CaptureAnimations from './CaptureAnimations';

export default function GameScene({ gameState, roomInfo, onPlayCard }) {
    const mySeat = roomInfo.seat;

    const seatLayout = useMemo(() => {
        const seats = [1, 2, 3, 4];
        const idx = seats.indexOf(mySeat);
        const r = [...seats.slice(idx), ...seats.slice(0, idx)];
        return { me: r[0], left: r[1], across: r[2], right: r[3] };
    }, [mySeat]);

    const getOpp = (seat) => gameState.opponents.find(o => o.seat === seat);

    const isMyTurn = gameState.currentPlayerSeat === mySeat
        && gameState.state === 'active'
        && (gameState.phase === 'active' || gameState.phase === 'chain_window');

    const oppPositions = {
        left: { pos: [-3, 0, 0], rot: [0, Math.PI / 2, 0] },
        across: { pos: [0, 0, -3], rot: [0, Math.PI, 0] },
        right: { pos: [3, 0, 0], rot: [0, -Math.PI / 2, 0] },
    };

    return (
        <Canvas
            shadows
            gl={{ antialias: true, alpha: false, toneMapping: 1 }}
            style={{ position: 'absolute', inset: 0, zIndex: 1 }}
        >
            {/* ═══ CAMERA ═══ */}
            <PerspectiveCamera
                makeDefault
                position={[0, 3.0, 4.0]}
                rotation={[-0.4, 0, 0]}
                fov={58}
                near={0.1}
                far={60}
            >
                <Suspense fallback={null}>
                    <Hand3D
                        cards={gameState.myHand}
                        isMyTurn={isMyTurn}
                        onPlayCard={onPlayCard}
                    />
                </Suspense>
            </PerspectiveCamera>

            {/* ═══ LIGHTING — Warm outdoor riad courtyard, late afternoon ═══ */}

            {/* Sky hemisphere */}
            <hemisphereLight intensity={0.6} color="#87CEEB" groundColor="#8B6914" />

            {/* Warm ambient — sunny courtyard feel */}
            <ambientLight intensity={0.8} color="#ffe4b5" />

            {/* Main sun — golden hour directional */}
            <directionalLight
                position={[5, 8, 3]}
                intensity={3}
                color="#ffd080"
                castShadow
                shadow-bias={-0.0001}
                shadow-mapSize={[2048, 2048]}
            />

            {/* Table spotlight — warm pool of light */}
            <spotLight
                position={[0, 5, 0]}
                angle={0.7}
                penumbra={0.7}
                intensity={15}
                color="#ffcc66"
                castShadow
            />

            {/* Fill lights */}
            <pointLight position={[0, 0.5, 0]} intensity={4} color="#ffa94d" distance={5} decay={2} />
            <pointLight position={[0, 2.5, 3.5]} intensity={3} color="#fff5e6" distance={6} decay={2} />
            <pointLight position={[-3, 2, 0]} intensity={2} color="#ffd699" distance={5} decay={2} />
            <pointLight position={[3, 2, 0]} intensity={2} color="#ffd699" distance={5} decay={2} />

            {/* Warm sky-like background */}
            <color attach="background" args={['#1a120a']} />

            {/* ═══ RIAD COURTYARD ENVIRONMENT ═══ */}

            {/* FLOOR — Terracotta tiles */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.88, 0]} receiveShadow>
                <planeGeometry args={[24, 24]} />
                <meshPhysicalMaterial
                    color="#c47a4a"
                    roughness={0.8}
                    metalness={0.05}
                    clearcoat={0.15}
                />
            </mesh>

            {/* Floor tile pattern — diamond grid */}
            <mesh rotation={[-Math.PI / 2, 0, Math.PI / 4]} position={[0, -0.875, 0]} receiveShadow>
                <planeGeometry args={[8, 8]} />
                <meshPhysicalMaterial
                    color="#b06a3a"
                    roughness={0.85}
                />
            </mesh>

            {/* ═══ TADELAKT WALLS — Moroccan plaster walls ═══ */}
            {/* Back wall */}
            <mesh position={[0, 3, -8]} receiveShadow>
                <planeGeometry args={[20, 8]} />
                <meshPhysicalMaterial
                    color="#e8d5b8"
                    roughness={0.7}
                    metalness={0.02}
                    clearcoat={0.2}
                    clearcoatRoughness={0.4}
                />
            </mesh>

            {/* Left wall */}
            <mesh position={[-8, 3, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
                <planeGeometry args={[20, 8]} />
                <meshPhysicalMaterial color="#e0cca8" roughness={0.7} clearcoat={0.2} />
            </mesh>

            {/* Right wall */}
            <mesh position={[8, 3, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
                <planeGeometry args={[20, 8]} />
                <meshPhysicalMaterial color="#e0cca8" roughness={0.7} clearcoat={0.2} />
            </mesh>

            {/* ═══ HORSESHOE ARCHES on back wall ═══ */}
            {[-3, 0, 3].map((x, i) => (
                <group key={`arch-${i}`} position={[x, 2.5, -7.9]}>
                    {/* Arch frame */}
                    <mesh>
                        <boxGeometry args={[1.8, 3.5, 0.15]} />
                        <meshPhysicalMaterial
                            color="#d4c0a0"
                            roughness={0.65}
                            clearcoat={0.15}
                        />
                    </mesh>
                    {/* Dark arch opening */}
                    <mesh position={[0, -0.3, 0.02]}>
                        <boxGeometry args={[1.2, 2.5, 0.12]} />
                        <meshPhysicalMaterial color="#2a1a0e" roughness={0.9} />
                    </mesh>
                    {/* Arch top — semicircle */}
                    <mesh position={[0, 0.95, 0.02]}>
                        <sphereGeometry args={[0.6, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
                        <meshPhysicalMaterial color="#2a1a0e" roughness={0.9} />
                    </mesh>
                    {/* Zellige tile strip at the arch base */}
                    <mesh position={[0, -1.5, 0.05]}>
                        <boxGeometry args={[1.6, 0.4, 0.08]} />
                        <meshPhysicalMaterial
                            color="#1a5a4a"
                            roughness={0.5}
                            metalness={0.1}
                            clearcoat={0.4}
                        />
                    </mesh>
                </group>
            ))}

            {/* ═══ ZELLIGE TILE STRIP — Along bottom of walls ═══ */}
            <mesh position={[0, -0.2, -7.95]}>
                <boxGeometry args={[16, 1.2, 0.08]} />
                <meshPhysicalMaterial
                    color="#1a6a5a"
                    roughness={0.5}
                    metalness={0.1}
                    clearcoat={0.4}
                />
            </mesh>

            {/* ═══ HANGING MOROCCAN LANTERNS ═══ */}
            {[[-2, 4.5, -4], [2, 4.5, -4], [0, 5, -2]].map((pos, i) => (
                <group key={`lantern-${i}`} position={pos}>
                    {/* Chain */}
                    <mesh position={[0, 0.8, 0]}>
                        <cylinderGeometry args={[0.01, 0.01, 1.5]} />
                        <meshPhysicalMaterial color="#3a2010" metalness={0.8} roughness={0.4} />
                    </mesh>
                    {/* Lantern body — pierced metal */}
                    <mesh castShadow>
                        <dodecahedronGeometry args={[0.35, 0]} />
                        <meshPhysicalMaterial
                            color="#c49a3c"
                            metalness={0.85}
                            roughness={0.2}
                            wireframe
                            clearcoat={0.5}
                        />
                    </mesh>
                    {/* Warm glow inside */}
                    <mesh>
                        <sphereGeometry args={[0.2, 12, 12]} />
                        <meshBasicMaterial color="#ffc266" transparent opacity={0.5} />
                    </mesh>
                    <pointLight
                        intensity={i === 2 ? 3 : 1.5}
                        color="#ffa040"
                        distance={6}
                        decay={2}
                    />
                </group>
            ))}

            {/* ═══ POTTED PLANTS — Orange trees / palms ═══ */}
            {[[-5, 0, -5], [5, 0, -5]].map((pos, i) => (
                <group key={`plant-${i}`} position={pos}>
                    {/* Terracotta pot */}
                    <mesh position={[0, -0.3, 0]} castShadow>
                        <cylinderGeometry args={[0.4, 0.55, 0.7, 16]} />
                        <meshPhysicalMaterial
                            color="#b05a2a"
                            roughness={0.85}
                            clearcoat={0.1}
                        />
                    </mesh>
                    {/* Pot rim */}
                    <mesh position={[0, 0.05, 0]}>
                        <torusGeometry args={[0.42, 0.04, 6, 16]} />
                        <meshPhysicalMaterial color="#b05a2a" roughness={0.85} />
                    </mesh>
                    {/* Trunk */}
                    <mesh position={[0, 0.8, 0]} castShadow>
                        <cylinderGeometry args={[0.06, 0.08, 1.5, 8]} />
                        <meshPhysicalMaterial color="#5a3a1a" roughness={0.8} />
                    </mesh>
                    {/* Foliage — cluster of spheres */}
                    {[[0, 0.2, 0], [0.3, 0, 0.1], [-0.2, 0.1, -0.2], [0.1, -0.1, 0.3]].map((off, j) => (
                        <mesh key={j} position={[off[0], 1.6 + off[1], off[2]]} castShadow>
                            <sphereGeometry args={[0.35 + j * 0.05, 12, 10]} />
                            <meshPhysicalMaterial
                                color="#2a6a30"
                                roughness={0.9}
                                clearcoat={0.1}
                            />
                        </mesh>
                    ))}
                </group>
            ))}

            {/* ═══ CUSHIONS / POUFS — Seating around the table ═══ */}
            {[
                [0, -0.5, 3.5, 0],
                [-3.5, -0.5, 0, Math.PI / 2],
                [0, -0.5, -3.5, Math.PI],
                [3.5, -0.5, 0, -Math.PI / 2]
            ].map(([x, y, z, ry], i) => (
                <group key={`cushion-${i}`} position={[x, y, z]} rotation={[0, ry, 0]}>
                    <mesh castShadow receiveShadow>
                        <cylinderGeometry args={[0.45, 0.5, 0.25, 16]} />
                        <meshPhysicalMaterial
                            color={['#8b2020', '#1a6050', '#c9a84c', '#2a4a8a'][i]}
                            roughness={0.9}
                            clearcoat={0.05}
                        />
                    </mesh>
                    {/* Cushion top — softer, puffed */}
                    <mesh position={[0, 0.15, 0]} castShadow>
                        <sphereGeometry args={[0.42, 16, 8, 0, Math.PI * 2, 0, Math.PI / 3]} />
                        <meshPhysicalMaterial
                            color={['#a03030', '#2a7060', '#d4b060', '#3a5a9a'][i]}
                            roughness={0.92}
                        />
                    </mesh>
                </group>
            ))}

            {/* ═══ TABLE ═══ */}
            <Suspense fallback={null}>
                <Table3D />
            </Suspense>

            {/* ═══ TABLE CARDS ═══ */}
            <Suspense fallback={null}>
                <TableCards3D cards={gameState.tableCards} />
                <CaptureAnimations
                    gameState={gameState}
                    oppPositions={oppPositions}
                    seatLayout={seatLayout}
                />
            </Suspense>

            {/* ═══ OPPONENTS ═══ */}
            {getOpp(seatLayout.left) && (
                <Opponent3D
                    seat={seatLayout.left}
                    position={oppPositions.left.pos}
                    rotation={oppPositions.left.rot}
                    username={getOpp(seatLayout.left).username}
                    team={getOpp(seatLayout.left).team}
                    isActive={gameState.currentPlayerSeat === seatLayout.left}
                    handCount={getOpp(seatLayout.left).handCount}
                />
            )}

            {getOpp(seatLayout.across) && (
                <Opponent3D
                    seat={seatLayout.across}
                    position={oppPositions.across.pos}
                    rotation={oppPositions.across.rot}
                    username={getOpp(seatLayout.across).username}
                    team={getOpp(seatLayout.across).team}
                    isActive={gameState.currentPlayerSeat === seatLayout.across}
                    handCount={getOpp(seatLayout.across).handCount}
                />
            )}

            {getOpp(seatLayout.right) && (
                <Opponent3D
                    seat={seatLayout.right}
                    position={oppPositions.right.pos}
                    rotation={oppPositions.right.rot}
                    username={getOpp(seatLayout.right).username}
                    team={getOpp(seatLayout.right).team}
                    isActive={gameState.currentPlayerSeat === seatLayout.right}
                    handCount={getOpp(seatLayout.right).handCount}
                />
            )}
        </Canvas>
    );
}
