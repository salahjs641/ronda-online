import React, { useMemo } from 'react';
import Agent from './Agent';
import Card from './Card';
import TableArea from './TableArea';
import ChatBox from './ChatBox';

const ScorePanel = ({ label, data, isMyTeam }) => (
  <div className={`score-panel ${isMyTeam ? 'my-team' : ''}`}>
    <h4>{label}</h4>
    <div className="score-row"><span className="label">Bant</span><span className="value">{data.bant}</span></div>
    <div className="score-row"><span className="label">Hbal</span><span className="value">{data.hbal}</span></div>
    {data.dfu3Kbir && <span className="dfu3-badge kbir">Dfu3 Kbir ✓</span>}
    {data.dfu3Sghir && <span className="dfu3-badge sghir">Dfu3 Sghir ✓</span>}
  </div>
);

const CafeTable = ({
  gameState,
  roomInfo,
  onPlayCard,
  onAnnounce,
  onSkipAnnounce,
  onClaimDfu3,
  onNextRound,
  chatMessages,
  onSendChat
}) => {
  if (!gameState) return <div className="waiting-room">Waiting for server...</div>;

  const mySeat = roomInfo.seat;
  const myTeam = roomInfo.team;

  const seatLayout = useMemo(() => {
    const seats = [1, 2, 3, 4];
    const index = seats.indexOf(mySeat);
    const reordered = [...seats.slice(index), ...seats.slice(0, index)];
    return {
      bottom: reordered[0],   // Me
      left: reordered[1],
      top: reordered[2],      // Across table
      right: reordered[3]
    };
  }, [mySeat]);

  const getOpponent = (seat) => gameState.opponents.find(o => o.seat === seat);

  const myTeamData = myTeam === 'A' ? gameState.teamA : gameState.teamB;
  const canClaimKbir = !myTeamData.dfu3Kbir && myTeamData.hbal >= 4 && myTeamData.bant >= 2;
  const canClaimSghir = myTeamData.dfu3Kbir && !myTeamData.dfu3Sghir && myTeamData.hbal >= 3 && myTeamData.bant >= 4;

  const isMyTurn = gameState.currentPlayerSeat === mySeat && gameState.state === 'active' && gameState.phase === 'active';

  return (
    <div className="game-viewport">
      <div className="fog-overlay" />

      {/* ─── Round Info HUD — top left ───── */}
      <div className="round-info-hud">
        <div className="info-label">Round</div>
        <div className="info-value">{gameState.roundNumber}</div>
        <div className="deck-remaining">🂠 {gameState.deckRemaining} left</div>
      </div>

      {/* ─── Score HUD — top right ───── */}
      <div className="score-hud">
        <ScorePanel label="Team A" data={gameState.teamA} isMyTeam={myTeam === 'A'} />
        <ScorePanel label="Team B" data={gameState.teamB} isMyTeam={myTeam === 'B'} />
      </div>

      {/* ─── 3D TABLE SCENE ───── */}
      <div className="table-3d-scene">

        {/* The round wooden table */}
        <div className="table-surface">
          <div className="table-felt">
            {/* Table cards centered on felt */}
            <div className="table-cards-zone">
              <TableArea cards={gameState.tableCards} />
            </div>

            {/* Seat indicators on the table edge */}
            <div className="seat-marker seat-marker-top">
              {getOpponent(seatLayout.top) && (
                <span className={gameState.currentPlayerSeat === seatLayout.top ? 'active-seat' : ''}>
                  ●
                </span>
              )}
            </div>
            <div className="seat-marker seat-marker-left">
              {getOpponent(seatLayout.left) && (
                <span className={gameState.currentPlayerSeat === seatLayout.left ? 'active-seat' : ''}>
                  ●
                </span>
              )}
            </div>
            <div className="seat-marker seat-marker-right">
              {getOpponent(seatLayout.right) && (
                <span className={gameState.currentPlayerSeat === seatLayout.right ? 'active-seat' : ''}>
                  ●
                </span>
              )}
            </div>
            <div className="seat-marker seat-marker-bottom">
              <span className={isMyTurn ? 'active-seat' : ''}>●</span>
            </div>
          </div>
        </div>

        {/* ─── Opponent: TOP (across) ───── */}
        <div className="agent-position agent-top">
          {getOpponent(seatLayout.top) && (
            <Agent
              seat={seatLayout.top}
              username={getOpponent(seatLayout.top).username}
              team={getOpponent(seatLayout.top).team}
              isActive={gameState.currentPlayerSeat === seatLayout.top}
              handCount={getOpponent(seatLayout.top).handCount}
            />
          )}
          {/* Face-down cards for top opponent */}
          {getOpponent(seatLayout.top) && (
            <div className="opp-cards opp-cards-top">
              {Array.from({ length: getOpponent(seatLayout.top).handCount || 0 }).map((_, i) => (
                <div key={i} className="opp-card-back" style={{ transform: `rotate(${(i - 1.5) * 6}deg)` }} />
              ))}
            </div>
          )}
        </div>

        {/* ─── Opponent: LEFT ───── */}
        <div className="agent-position agent-left">
          {getOpponent(seatLayout.left) && (
            <Agent
              seat={seatLayout.left}
              username={getOpponent(seatLayout.left).username}
              team={getOpponent(seatLayout.left).team}
              isActive={gameState.currentPlayerSeat === seatLayout.left}
              handCount={getOpponent(seatLayout.left).handCount}
            />
          )}
          {getOpponent(seatLayout.left) && (
            <div className="opp-cards opp-cards-side">
              {Array.from({ length: getOpponent(seatLayout.left).handCount || 0 }).map((_, i) => (
                <div key={i} className="opp-card-back" style={{ transform: `translateY(${i * 4}px) rotate(${90 + (i - 1.5) * 5}deg)` }} />
              ))}
            </div>
          )}
        </div>

        {/* ─── Opponent: RIGHT ───── */}
        <div className="agent-position agent-right">
          {getOpponent(seatLayout.right) && (
            <Agent
              seat={seatLayout.right}
              username={getOpponent(seatLayout.right).username}
              team={getOpponent(seatLayout.right).team}
              isActive={gameState.currentPlayerSeat === seatLayout.right}
              handCount={getOpponent(seatLayout.right).handCount}
            />
          )}
          {getOpponent(seatLayout.right) && (
            <div className="opp-cards opp-cards-side">
              {Array.from({ length: getOpponent(seatLayout.right).handCount || 0 }).map((_, i) => (
                <div key={i} className="opp-card-back" style={{ transform: `translateY(${i * 4}px) rotate(${-90 + (i - 1.5) * 5}deg)` }} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── My Hand — bottom of screen ───── */}
      <div className="fp-hand-container">
        {gameState.myHand.map((card, i) => (
          <Card
            key={card.code}
            card={card}
            index={i}
            total={gameState.myHand.length}
            onClick={isMyTurn ? () => onPlayCard(card.code) : null}
          />
        ))}
      </div>

      {/* ─── Turn Indicator ───── */}
      {isMyTurn && (
        <div className="player-turn-hint">YOUR TURN</div>
      )}

      {/* ─── Announcement Overlay ───── */}
      {gameState.phase === 'announcing' && !gameState.announcements[mySeat] && gameState.state === 'active' && (
        <div className="announcement-overlay">
          <h2>Your Turn to Announce</h2>
          <div className="announce-options">
            <button onClick={() => onAnnounce('ronda')}>Ronda</button>
            <button onClick={() => onAnnounce('tringa')}>Tringa</button>
            <button onClick={onSkipAnnounce}>Mafi Walou</button>
          </div>
        </div>
      )}

      {/* ─── Dfu3 Claim ───── */}
      {(canClaimKbir || canClaimSghir) && gameState.state === 'active' && (
        <div className="dfu3-claim-container">
          {canClaimKbir && <button className="btn-dfu3" onClick={() => onClaimDfu3('kbir')}>Claim Dfu3 Kbir</button>}
          {canClaimSghir && <button className="btn-dfu3" onClick={() => onClaimDfu3('sghir')}>Claim Dfu3 Sghir</button>}
        </div>
      )}

      {/* ─── Round End ───── */}
      {gameState.state === 'round_ended' && !gameState.winner && (
        <div className="round-end-overlay">
          <h2>Round {gameState.roundNumber} Complete</h2>
          <p>Team A: {gameState.teamA.bant} Bant / {gameState.teamA.hbal} Hbal — Team B: {gameState.teamB.bant} Bant / {gameState.teamB.hbal} Hbal</p>
          {onNextRound && <button className="btn-cafe primary" onClick={onNextRound}>Next Round</button>}
        </div>
      )}

      {/* ─── Game Over ───── */}
      {gameState.winner && (
        <div className="game-over-overlay">
          <h2>Game Over</h2>
          <div className="winner-text">Team {gameState.winner} Wins! 🏆</div>
          <p>{gameState.winner === myTeam ? 'Congratulations!' : 'Better luck next time!'}</p>
        </div>
      )}
    </div>
  );
};

export default CafeTable;
