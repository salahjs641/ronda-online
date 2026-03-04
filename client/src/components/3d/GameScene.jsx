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
                position={[0, 2.8, 3.8]}
                rotation={[-0.38, 0, 0]}
                fov={60}
                near={0.1}
                far={50}
            >
                <Suspense fallback={null}>
                    <Hand3D
                        cards={gameState.myHand}
                        isMyTurn={isMyTurn}
                        onPlayCard={onPlayCard}
                    />
                </Suspense>
            </PerspectiveCamera>

            {/* ═══ LIGHTING — Warm, atmospheric Moroccan parlor ═══ */}

            {/* Cool sky fill */}
            <hemisphereLight intensity={0.5} color="#b8c4e0" groundColor="#2a1a0a" />

            {/* Warm ambient base */}
            <ambientLight intensity={1.0} color="#e8c99a" />

            {/* Main overhead chandelier spotlight */}
            <spotLight
                position={[0, 4.5, 0]}
                angle={0.85}
                penumbra={0.6}
                intensity={22}
                color="#ffcc66"
                castShadow
                shadow-bias={-0.0001}
                shadow-mapSize={[2048, 2048]}
            />

            {/* WARM TABLE CENTER — golden pool of light */}
            <pointLight position={[0, 0.6, 0]} intensity={5} color="#ffa94d" distance={5} decay={2} />

            {/* POV fill on player's cards */}
            <pointLight position={[0, 2.5, 3.2]} intensity={4} color="#fff5e6" distance={7} decay={2} />

            {/* Side fills for opponents */}
            <pointLight position={[-3.5, 2.5, 0]} intensity={2.5} color="#ffd699" distance={6} decay={2} />
            <pointLight position={[3.5, 2.5, 0]} intensity={2.5} color="#ffd699" distance={6} decay={2} />

            {/* Backlight for depth */}
            <pointLight position={[0, 2, -4]} intensity={1.5} color="#cc8844" distance={6} decay={2} />

            <color attach="background" args={['#0a0704']} />

            {/* ═══ ENVIRONMENT ═══ */}

            {/* Ornate Hanging Lantern — Moroccan pierced metal */}
            <group position={[0, 4, 0]}>
                {/* Chain links */}
                {[0, 1, 2, 3].map((i) => (
                    <mesh key={`chain-${i}`} position={[0, 0.5 + i * 0.22, 0]}>
                        <torusGeometry args={[0.03, 0.008, 6, 12]} />
                        <meshPhysicalMaterial color="#3a2010" metalness={0.85} roughness={0.3} />
                    </mesh>
                ))}
                {/* Lantern cage — wireframe octahedron */}
                <mesh castShadow>
                    <octahedronGeometry args={[0.45, 0]} />
                    <meshPhysicalMaterial
                        color="#c49a3c"
                        metalness={0.9}
                        roughness={0.15}
                        wireframe
                        clearcoat={0.6}
                        emissive="#8a6a1a"
                        emissiveIntensity={0.1}
                    />
                </mesh>
                {/* Warm internal glow orb */}
                <mesh>
                    <sphereGeometry args={[0.35, 16, 16]} />
                    <meshBasicMaterial color="#ffc266" transparent opacity={0.6} />
                </mesh>
                {/* Secondary glow */}
                <mesh>
                    <sphereGeometry args={[0.2, 12, 12]} />
                    <meshBasicMaterial color="#ffe0a0" />
                </mesh>
            </group>

            {/* Side wall lanterns */}
            {[-1, 1].map((side) => (
                <group key={`lantern-${side}`} position={[side * 5, 3, -2]}>
                    <mesh>
                        <octahedronGeometry args={[0.2, 0]} />
                        <meshPhysicalMaterial color="#c49a3c" metalness={0.9} roughness={0.15} wireframe />
                    </mesh>
                    <mesh>
                        <sphereGeometry args={[0.15, 10, 10]} />
                        <meshBasicMaterial color="#ffcc66" transparent opacity={0.4} />
                    </mesh>
                    <pointLight position={[0, 0, 0]} intensity={1} color="#ffa040" distance={4} decay={2} />
                </group>
            ))}

            {/* ═══ FLOOR — Ornate Moroccan tiles with rug ═══ */}
            <group>
                {/* Main floor */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.62, 0]} receiveShadow>
                    <planeGeometry args={[20, 20]} />
                    <meshPhysicalMaterial
                        color="#1a1410"
                        roughness={0.6}
                        metalness={0.12}
                        clearcoat={0.35}
                        clearcoatRoughness={0.2}
                    />
                </mesh>
                {/* Decorative rug — outer border */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.615, 0]} receiveShadow>
                    <planeGeometry args={[7.5, 7.5]} />
                    <meshPhysicalMaterial
                        color="#4a1a12"
                        roughness={0.92}
                        clearcoat={0.08}
                    />
                </mesh>
                {/* Inner rug pattern */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.61, 0]}>
                    <planeGeometry args={[6.5, 6.5]} />
                    <meshPhysicalMaterial
                        color="#5a2218"
                        roughness={0.95}
                        clearcoat={0.05}
                    />
                </mesh>
                {/* Center medallion */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.605, 0]}>
                    <circleGeometry args={[2.5, 48]} />
                    <meshPhysicalMaterial
                        color="#3a1510"
                        roughness={0.95}
                    />
                </mesh>
            </group>

            {/* ═══ WALLS — Curved Moroccan-style alcove ═══ */}
            <mesh position={[0, 2.5, 0]} receiveShadow>
                <cylinderGeometry args={[9, 9, 9, 48, 1, true, -Math.PI / 1.5, Math.PI * 1.35]} />
                <meshPhysicalMaterial
                    color="#25140c"
                    roughness={0.75}
                    clearcoat={0.12}
                    clearcoatRoughness={0.5}
                    side={2}
                />
            </mesh>

            {/* Ceiling */}
            <mesh position={[0, 6.5, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
                <circleGeometry args={[9, 48]} />
                <meshPhysicalMaterial color="#1a0e08" roughness={0.9} side={2} />
            </mesh>

            {/* Decorative arched wall niches */}
            {[-1, 0, 1].map((i) => (
                <group key={`niche-${i}`} position={[i * 3.5, 2.5, -7]} rotation={[0, i * 0.15, 0]}>
                    <mesh>
                        <boxGeometry args={[1.2, 2, 0.15]} />
                        <meshPhysicalMaterial
                            color="#1e100a"
                            roughness={0.85}
                            clearcoat={0.1}
                        />
                    </mesh>
                    {/* Arch top */}
                    <mesh position={[0, 1.0, 0]}>
                        <sphereGeometry args={[0.6, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
                        <meshPhysicalMaterial color="#1e100a" roughness={0.85} />
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
