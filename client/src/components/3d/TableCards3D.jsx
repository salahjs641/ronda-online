import React from 'react';
import Card3D from './Card3D';

export default function TableCards3D({ cards }) {
    if (!cards || cards.length === 0) return null;

    const total = cards.length;

    // Cards spread in a gentle arc across the felt, facing the player
    // Slightly overlapping for a natural "dealt" look
    const spacing = 0.75;
    const totalWidth = Math.min((total - 1) * spacing, 3.6);

    return (
        // Positioned on the felt surface, tilted toward player's POV
        <group position={[0, 0.2, -0.3]}>
            {cards.map((card, i) => {
                const t = total === 1 ? 0 : (i / (total - 1)) * 2 - 1;
                const x = t * totalWidth * 0.5;

                // Slight random-looking scatter for realism (deterministic from index)
                const jitterX = Math.sin(i * 4.3) * 0.06;
                const jitterZ = Math.cos(i * 2.7) * 0.08;
                const jitterRot = Math.sin(i * 3.1) * 0.06;

                // Slight y-stacking so overlapping cards render clean
                const y = i * 0.003;

                return (
                    <Card3D
                        key={card.code || i}
                        card={card}
                        position={[x + jitterX, y, jitterZ]}
                        rotation={[-1.15, 0, jitterRot]}
                        isPlayable={false}
                        scale={1.15}
                    />
                );
            })}
        </group>
    );
}
