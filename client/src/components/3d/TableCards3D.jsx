import React from 'react';
import Card3D from './Card3D';

export default function TableCards3D({ cards }) {
    if (!cards || cards.length === 0) return null;

    const total = cards.length;
    const spacing = 0.7;
    const totalWidth = (total - 1) * spacing;

    return (
        // Slightly above the felt, tilted to face the player's POV
        <group position={[0, 0.3, 0.4]}>
            {cards.map((card, i) => {
                const t = total === 1 ? 0 : (i / (total - 1)) * 2 - 1;
                const x = t * totalWidth * 0.5;
                const jitterZ = Math.sin(i * 2.7) * 0.04;
                const jitterRot = Math.sin(i * 3.1) * 0.04;

                return (
                    <Card3D
                        key={card.code || i}
                        card={card}
                        position={[x, 0, jitterZ]}
                        rotation={[-1.25, 0, jitterRot]}
                        isPlayable={false}
                        scale={1.0}
                    />
                );
            })}
        </group>
    );
}
