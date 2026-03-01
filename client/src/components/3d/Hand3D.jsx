import React from 'react';
import Card3D from './Card3D';

export default function Hand3D({ cards, isMyTurn, onPlayCard }) {
    console.log('Rendering Hand3D, cards count:', cards?.length);
    if (!cards || cards.length === 0) return null;

    const total = cards.length;
    const spacing = 0.55;
    const totalWidth = (total - 1) * spacing;

    // Camera is at (0, 2.6, 3.5)
    // COORDINATES are relative to Camera (nested in PerspectiveCamera)
    return (
        <group position={[0, -0.6, -2.5]} rotation={[0.2, 0, 0]}>
            {cards.map((card, i) => {
                const t = total === 1 ? 0 : (i / (total - 1)) * 2 - 1;
                const x = t * totalWidth * 0.5;
                const y = -Math.abs(t) * 0.03;
                const z = i * 0.012;
                const rotZ = -t * 0.04;

                return (
                    <Card3D
                        key={card.code}
                        card={card}
                        position={[x, y, z]}
                        rotation={[0, 0, rotZ]}
                        isPlayable={isMyTurn}
                        onClick={() => onPlayCard(card.code)}
                        scale={1.3} // Made cards larger so they are clearly visible
                    />
                );
            })}
        </group>
    );
}
