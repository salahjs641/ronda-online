import React, { useEffect, useState, useRef } from 'react';
import { useSpring, a } from '@react-spring/three';
import Card3D from './Card3D';

function AnimatedCardGroup({ cards, targetPosition, onRest }) {
    const { position, scale } = useSpring({
        from: { position: [0, 0.4, 0], scale: 1 },
        to: async (next) => {
            // First jump up to draw attention
            await next({ position: [0, 1.5, 0], scale: 1.2, config: { tension: 200, friction: 15 } });
            // Then fly to capturer
            await next({ position: targetPosition, scale: 0.1, config: { tension: 120, friction: 20 } });
        },
        onRest: onRest
    });

    return (
        <a.group position={position} scale={scale}>
            {cards.map((c, i) => {
                const offsetX = (i - cards.length / 2) * 0.3;
                return (
                    <Card3D
                        key={`${c.code}-${i}`}
                        card={c}
                        position={[offsetX, 0, i * 0.05]}
                        rotation={[-1.25, 0, 0]}
                        isPlayable={false}
                    />
                );
            })}
        </a.group>
    );
}

/**
 * Reads lastCapture directly from gameState — no dependency on separate socket events.
 * Every capture is guaranteed to produce a lastCapture in the game state.
 */
export default function CaptureAnimations({ gameState, oppPositions, seatLayout }) {
    const [animations, setAnimations] = useState([]);
    const lastTimestampRef = useRef(null);

    useEffect(() => {
        const capture = gameState?.lastCapture;
        if (!capture || !capture.captured || capture.captured.length === 0) return;

        // Deduplicate — only animate if this is a NEW capture (different timestamp)
        if (capture.timestamp === lastTimestampRef.current) return;
        lastTimestampRef.current = capture.timestamp;

        console.log('🎬 Capture animation triggered!', {
            seat: capture.seat,
            card: capture.card?.code,
            capturedCount: capture.captured.length
        });

        const allCards = [capture.card, ...capture.captured];

        // Default to 'me' (bottom of screen)
        let targetPos = [0, -1, 3];

        if (capture.seat === seatLayout.left) targetPos = oppPositions.left.pos;
        else if (capture.seat === seatLayout.across) targetPos = oppPositions.across.pos;
        else if (capture.seat === seatLayout.right) targetPos = oppPositions.right.pos;

        const newAnim = {
            id: Date.now() + Math.random(),
            cards: allCards,
            targetPosition: [targetPos[0] * 0.8, targetPos[1] + 1, targetPos[2] * 0.8],
        };

        setAnimations(prev => [...prev, newAnim]);
    }, [gameState?.lastCapture, seatLayout, oppPositions]);

    const removeAnimation = (id) => {
        setAnimations(prev => prev.filter(a => a.id !== id));
    };

    return (
        <group>
            {animations.map(anim => (
                <AnimatedCardGroup
                    key={anim.id}
                    cards={anim.cards}
                    targetPosition={anim.targetPosition}
                    onRest={() => removeAnimation(anim.id)}
                />
            ))}
        </group>
    );
}
