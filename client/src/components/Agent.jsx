import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const Agent = ({ seat, username, team, isActive, handCount = 0 }) => {
    const containerRef = useRef(null);
    const headRef = useRef(null);
    const shouldersRef = useRef(null);

    const configs = {
        1: { role: 'Sultan', color: '#c9a84c', secondary: '#2c1a10', icon: '👑' },
        2: { role: 'Merchant', color: '#1b4d36', secondary: '#0a1a12', icon: '🏺' },
        3: { role: 'Berber', color: '#7a1818', secondary: '#3a0808', icon: '⚔️' },
        4: { role: 'Scholar', color: '#2a5a9b', secondary: '#14336b', icon: '📜' }
    };

    const config = configs[seat] || configs[1];

    useEffect(() => {
        // Idle breathing
        gsap.to(headRef.current, {
            y: -3, x: 1.5, rotate: 1,
            duration: 3.5, repeat: -1, yoyo: true, ease: "sine.inOut"
        });

        gsap.to(shouldersRef.current, {
            y: -2, duration: 4.5, repeat: -1, yoyo: true, ease: "sine.inOut"
        });
    }, [seat]);

    useEffect(() => {
        if (isActive) {
            gsap.to(containerRef.current, {
                y: -15, scale: 1.06, filter: "brightness(1.3)",
                duration: 0.6, ease: "power2.out"
            });
        } else {
            gsap.to(containerRef.current, {
                y: 0, scale: 1, filter: "brightness(0.7)",
                duration: 0.8, ease: "power2.inOut"
            });
        }
    }, [isActive]);

    return (
        <div className={`agent-container ${isActive ? 'is-active' : ''}`} ref={containerRef}>
            <div className="turn-spotlight" style={{ '--gold-glow': config.color + '44' }} />

            {/* Tea Glass */}
            <div className="agent-prop-slot">
                <div className="tea-glass-prop">
                    <div className="steam-container">
                        {[1, 2, 3].map(i => <div key={i} className="steam-wisp" />)}
                    </div>
                </div>
            </div>

            <div className="agent-avatar">
                {/* Card count badge */}
                <div className="agent-card-count">{handCount}</div>

                <div className="agent-head" ref={headRef} style={{
                    borderColor: config.color,
                    background: config.secondary
                }}>
                    <div className="head-glow" />
                    <span className="char-icon">{config.icon}</span>
                </div>

                <div className="agent-shoulders" ref={shouldersRef} style={{
                    borderColor: config.color,
                    background: config.secondary
                }}>
                    <div className="agent-rim-light" />
                </div>
            </div>

            <div className="hud-label" style={{ color: config.color, borderColor: config.color }}>
                {username || config.role}
                <span style={{ opacity: 0.5, marginLeft: 6, fontSize: '9px' }}>
                    {team === 'A' ? '🔵' : '🟠'}
                </span>
            </div>
        </div>
    );
};

export default Agent;
