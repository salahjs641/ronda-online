import React, { useState, useEffect } from 'react';

const ScorePanel = ({ label, data, isMyTeam }) => (
    <div className={`score-panel ${isMyTeam ? 'my-team' : ''}`}>
        <h4>{label}</h4>
        <div className="score-row">
            <span className="label">Bant</span>
            <span className="value">{data.bant}</span>
        </div>
        <div className="score-row">
            <span className="label">Hbal</span>
            <span className="value">{data.hbal}</span>
        </div>
        <div className="dfu-badges">
            {data.dfu3Kbir && <span className="dfu3-badge kbir">Kbir ✓</span>}
            {data.dfu3Sghir && <span className="dfu3-badge sghir">Sghir ✓</span>}
        </div>
    </div>
);

export default function GameHUD({
    gameState,
    roomInfo,
    onAnnounce,
    onSkipAnnounce,
    onClaimDfu3,
    onNextRound
}) {
    const [eventLog, setEventLog] = useState([]);

    useEffect(() => {
        if (gameState?.lastAction) {
            const action = gameState.lastAction;
            const msg = `${action.username} played ${action.card.suit}_${action.card.value} ${action.events.length > 0 ? '(' + action.events.join(', ') + ')' : ''}`;
            setEventLog(prev => [msg, ...prev].slice(0, 3));
        }
    }, [gameState?.lastAction]);

    if (!gameState) return null;

    const mySeat = roomInfo.seat;
    const myTeam = roomInfo.team;
    const isMyTurn = gameState.currentPlayerSeat === mySeat && gameState.state === 'active' && gameState.phase === 'active';
    const myTeamData = myTeam === 'A' ? gameState.teamA : gameState.teamB;

    const canClaimKbir = !myTeamData.dfu3Kbir && myTeamData.hbal >= 4 && myTeamData.bant >= 2;
    const canClaimSghir = myTeamData.dfu3Kbir && !myTeamData.dfu3Sghir && myTeamData.hbal >= 3 && myTeamData.bant >= 4;

    const myAnnounceDone = gameState.announceDone?.[mySeat];

    return (
        <div className="game-hud-overlay">
            {/* Top Bar / Round Info */}
            <div className="top-hud">
                <div className="round-badge">
                    <span className="label">Round</span>
                    <span className="number">{gameState.roundNumber}</span>
                </div>
                <div className="deck-badge">
                    🂠 {gameState.deckRemaining}
                </div>
                {gameState.lastAction && (
                    <div className="event-feed">
                        {eventLog.map((log, i) => (
                            <div key={i} className={`event-msg ${i === 0 ? 'active' : ''}`}>{log}</div>
                        ))}
                    </div>
                )}
            </div>

            {/* Scores Side Panels */}
            <div className="score-hud">
                <ScorePanel label="TEAM A" data={gameState.teamA} isMyTeam={myTeam === 'A'} />
                <ScorePanel label="TEAM B" data={gameState.teamB} isMyTeam={myTeam === 'B'} />
            </div>

            {/* Turn Indicator */}
            {isMyTurn && <div className="turn-banner">YOUR TURN</div>}

            {/* Opponent Turn Indicator */}
            {!isMyTurn && gameState.state === 'active' && (
                <div className="turn-banner minor">
                    WAITING FOR SEAT {gameState.currentPlayerSeat}
                </div>
            )}

            {/* Announcement Phase Overlay */}
            {/* Announcement Phase UI - Non-blocking prompt */}
            {gameState.phase === 'announcing' && !myAnnounceDone && gameState.state === 'active' && (
                <div className="announcement-prompt-pos">
                    <div className="announce-card-view">
                        <span className="prompt-text">Announce?</span>
                        <div className="btn-group">
                            <button className="btn-mini ronda" onClick={() => onAnnounce('ronda')}>Ronda</button>
                            <button className="btn-mini tringa" onClick={() => onAnnounce('tringa')}>Tringa</button>
                            <button className="btn-mini skip" onClick={onSkipAnnounce}>No</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Announcement Status (Who is left) */}
            {gameState.phase === 'announcing' && gameState.state === 'active' && (
                <div className="announce-status">
                    <span className="label">Announcing:</span>
                    {[1, 2, 3, 4].map(s => (
                        <div key={s} className={`status-dot ${gameState.announceDone?.[s] ? 'done' : 'pending'} ${s === mySeat ? 'me' : ''}`}>
                            {s}
                        </div>
                    ))}
                </div>
            )}

            {/* Dfu3 Actions */}
            {(canClaimKbir || canClaimSghir) && gameState.state === 'active' && (
                <div className="floating-actions">
                    {canClaimKbir && (
                        <button className="btn-dfu3 kbir pulse" onClick={() => onClaimDfu3('kbir')}>
                            CLAIM DFU3 KBIR
                        </button>
                    )}
                    {canClaimSghir && (
                        <button className="btn-dfu3 sghir pulse" onClick={() => onClaimDfu3('sghir')}>
                            CLAIM DFU3 SGHIR
                        </button>
                    )}
                </div>
            )}

            {/* Round Over Overlay */}
            {gameState.state === 'round_ended' && !gameState.winner && (
                <div className="fullscreen-overlay round-end">
                    <div className="overlay-glass">
                        <h2>Round {gameState.roundNumber} Results</h2>
                        <div className="result-stats">
                            <div className="team-stat">
                                <h3>Team A</h3>
                                <div className="stat-line">Cards: {gameState.cardCount?.teamA || 0}</div>
                                <div className="stat-line">Bant: {gameState.teamA.bant}</div>
                            </div>
                            <div className="vs-divider">VS</div>
                            <div className="team-stat">
                                <h3>Team B</h3>
                                <div className="stat-line">Cards: {gameState.cardCount?.teamB || 0}</div>
                                <div className="stat-line">Bant: {gameState.teamB.bant}</div>
                            </div>
                        </div>
                        {roomInfo.seat === 1 && (
                            <button className="btn-cafe primary" onClick={onNextRound}>Start Next Round</button>
                        )}
                        {roomInfo.seat !== 1 && (
                            <p className="waiting-text">Waiting for host to start next round...</p>
                        )}
                    </div>
                </div>
            )}

            {/* Game Over Overlay */}
            {gameState.winner && (
                <div className="fullscreen-overlay game-over">
                    <div className="overlay-glass">
                        <h1 className="winner-title">{gameState.winner === myTeam ? 'VICTORY' : 'DEFEAT'}</h1>
                        <div className="winner-sub">Team {gameState.winner} wins by Dfu3 Sghir!</div>
                        <button className="btn-cafe secondary" onClick={() => window.location.reload()}>Back to Menu</button>
                    </div>
                </div>
            )}
        </div>
    );
}
