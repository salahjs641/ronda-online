import React from 'react';
import Card from './Card';

const TableArea = ({ cards }) => {
  if (!cards || cards.length === 0) {
    return (
      <div className="table-area">
        <div className="table-empty-hint">No cards on table</div>
      </div>
    );
  }

  // Spread cards in a clean row with slight random tilt for natural feel
  const spread = Math.min(cards.length * 85, 400); // total width of spread
  const startX = -spread / 2;

  return (
    <div className="table-area">
      {cards.map((card, i) => {
        const x = startX + (i / Math.max(cards.length - 1, 1)) * spread;
        const tilt = (Math.sin(i * 2.7) * 8); // subtle natural tilt
        const yJitter = Math.cos(i * 3.1) * 4; // tiny vertical jitter

        return (
          <div
            key={card.code || i}
            className="table-card-slot"
            style={{
              transform: `translateX(${x}px) translateY(${yJitter}px) rotate(${tilt}deg)`,
              zIndex: i + 1
            }}
          >
            <Card card={card} index={i} total={cards.length} isTable={true} />
          </div>
        );
      })}
    </div>
  );
};

export default TableArea;
