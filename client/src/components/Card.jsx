import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

const Card = ({ card, index, total, onClick, isTable = false }) => {
  const cardRef = useRef(null);

  // Hand fan layout
  const rotation = isTable ? 0 : (index - (total - 1) / 2) * 7;
  const xOffset = isTable ? 0 : (index - (total - 1) / 2) * 40;
  const yOffset = isTable ? 0 : Math.abs(index - (total - 1) / 2) * 8;

  useEffect(() => {
    if (cardRef.current && !isTable) {
      gsap.to(cardRef.current, {
        rotateZ: rotation,
        x: xOffset,
        y: yOffset,
        rotateX: -12,
        duration: 0.5,
        ease: "back.out(1.2)"
      });
    }
  }, [index, total, isTable]);

  if (!card) {
    return <div className="card card-back" ref={cardRef} />;
  }

  const imgPath = `/assets/cards/${card.suit}_${card.value}.PNG`;

  return (
    <div
      className={`card-3d ${onClick ? 'is-playable' : ''} ${isTable ? 'is-table-card' : ''}`}
      ref={cardRef}
      onClick={onClick}
    >
      <div className="card-inner">
        <div className="card-front">
          <img src={imgPath} alt={`${card.value} of ${card.suit}`} />
        </div>
        <div className="card-back-cinematic" />
      </div>
    </div>
  );
};

export default Card;
