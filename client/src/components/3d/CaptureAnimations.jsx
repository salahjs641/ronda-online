import React, { useEffect, useState } from 'react';
import { useSpring, a } from '@react-spring/three';
import Card3D from './Card3D';

function AnimatedCardGroup({ cards, targetPosition, onRest }) {
    // We animate from center of table up, then towards target player
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

export default function CaptureAnimations({ lastEvent, oppPositions, seatLayout }) {
    const [animations, setAnimations] = useState([]);

    useEffect(() => {
        if (lastEvent) {
            console.log('🎬 CaptureAnimations received lastEvent:', {
                seat: lastEvent.seat,
                card: lastEvent.card?.code,
                capturedCount: lastEvent.captured?.length,
                eventsCount: lastEvent.events?.length
            });
        }
        if (lastEvent && lastEvent.captured && lastEvent.captured.length > 0) {
            const allCards = [lastEvent.card, ...lastEvent.captured];
            console.log('🎬 Creating capture animation with', allCards.length, 'cards');

            // Default to 'me' (bottom of screen)
            let targetPos = [0, -1, 3];

            if (lastEvent.seat === seatLayout.left) targetPos = oppPositions.left.pos;
            else if (lastEvent.seat === seatLayout.across) targetPos = oppPositions.across.pos;
            else if (lastEvent.seat === seatLayout.right) targetPos = oppPositions.right.pos;

            const newAnim = {
                id: Date.now() + Math.random(),
                cards: allCards,
                // Adjust target to be roughly chest level of opponent/player
                targetPosition: [targetPos[0] * 0.8, targetPos[1] + 1, targetPos[2] * 0.8],
            };

            setAnimations(prev => [...prev, newAnim]);
        }
    }, [lastEvent, seatLayout, oppPositions]);

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
