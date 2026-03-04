import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import Table3D from './Table3D';
import Hand3D from './Hand3D';
import TableCards3D from './TableCards3D';
import Opponent3D from './Opponent3D';
import CaptureAnimations from './CaptureAnimations';

export default function GameScene({ gameState, roomInfo, onPlayCard, lastEvent }) {
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
        && gameState.phase === 'active';

    // Opponent positions around the table
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
            {/* ═══ CAMERA — First person, sitting at the table ═══ */}
            <PerspectiveCamera
                makeDefault
                position={[0, 2.6, 3.5]}
                rotation={[-0.4, 0, 0]}
                fov={65}
                near={0.1}
                far={50}
            >
                {/* ═══ PLAYER HAND — Nested in camera to be FIXED in view ═══ */}
                <Suspense fallback={null}>
                    <Hand3D
                        cards={gameState.myHand}
                        isMyTurn={isMyTurn}
                        onPlayCard={onPlayCard}
                    />
                </Suspense>
            </PerspectiveCamera>

            {/* ═══ LIGHTING — Atmospheric & Cinematic Moroccan Parlor ═══ */}
            {/* Subtle cool fill light to mimic moonlight from windows */}
            <hemisphereLight intensity={0.2} color="#4a5d80" groundColor="#0a0a0a" />

            {/* Very dim ambient base */}
            <ambientLight intensity={0.4} color="#cca676" />

            {/* Dramatic center overhead spotlight mimicking a low-hanging chandelier */}
            <spotLight
                position={[0, 4, 0]}
                angle={0.8}
                penumbra={0.6}
                intensity={12}
                color="#ffb854"
                castShadow
                shadow-bias={-0.0001}
                shadow-mapSize={[2048, 2048]}
            />

            {/* Warm table-center bounce light */}
            <pointLight position={[0, 0.5, 0]} intensity={2.5} color="#e08e36" distance={4} decay={2} />

            {/* POV Fill - Just enough to see cards */}
            <pointLight position={[0, 2, 2]} intensity={1.5} color="#ffffff" distance={5} decay={2} />

            <color attach="background" args={['#050302']} />

            {/* ═══ ENVIRONMENT DETAILS ═══ */}
            {/* Ornate Hanging Lantern */}
            <group position={[0, 3.5, 0]}>
                {/* Chain */}
                <mesh position={[0, 1, 0]}>
                    <cylinderGeometry args={[0.02, 0.02, 2]} />
                    <meshPhysicalMaterial color="#1a1a1a" metalness={0.8} roughness={0.4} clearcoat={0.3} />
                </mesh>
                {/* Lantern Body */}
                <mesh castShadow>
                    <octahedronGeometry args={[0.4, 0]} />
                    <meshPhysicalMaterial color="#d4a350" metalness={0.9} roughness={0.2} wireframe clearcoat={0.5} />
                </mesh>
                {/* Internal Glow */}
                <mesh>
                    <sphereGeometry args={[0.3, 16, 16]} />
                    <meshBasicMaterial color="#ffc266" />
                </mesh>
            </group>

            {/* ═══ FLOOR — Ornate tiled floor ═══ */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.62, 0]} receiveShadow>
                <planeGeometry args={[20, 20]} />
                <meshPhysicalMaterial color="#1f1814" roughness={0.7} metalness={0.1} clearcoat={0.3} clearcoatRoughness={0.2} />
                {/* Outer Rug */}
                <mesh position={[0, 0, 0.01]} receiveShadow>
                    <planeGeometry args={[7, 7]} />
                    <meshPhysicalMaterial color="#551d1a" roughness={0.9} clearcoat={0.1} clearcoatRoughness={0.9} />
                </mesh>
            </mesh>

            {/* ═══ SURROUNDING WALLS — Curved Alcove ═══ */}
            <mesh position={[0, 2, 0]} receiveShadow>
                <cylinderGeometry args={[8, 8, 8, 32, 1, true, -Math.PI / 1.5, Math.PI * 1.3]} />
                <meshPhysicalMaterial color="#2d1712" roughness={0.8} clearcoat={0.1} clearcoatRoughness={0.6} side={2} />
            </mesh>

            {/* ═══ TABLE ═══ */}
            <Suspense fallback={null}>
                <Table3D />
            </Suspense>

            {/* ═══ TABLE CARDS ═══ */}
            <Suspense fallback={null}>
                <TableCards3D cards={gameState.tableCards} />
                <CaptureAnimations
                    lastEvent={lastEvent}
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
