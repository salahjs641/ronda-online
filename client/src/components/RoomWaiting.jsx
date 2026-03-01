import React from 'react';

const RoomWaiting = ({ roomData, roomInfo, onStart }) => {
  const isHost = roomInfo.seat === 1;
  const connectedCount = roomData?.players.filter(p => p.connected).length || 0;

  return (
    <div className="room-waiting-overlay">
      <div className="waiting-glass">
        <h2 className="room-code-title">Room Code</h2>
        <div className="room-code-display">{roomData?.roomCode}</div>

        <div className="player-list">
          {roomData?.players.map((p, i) => (
            <div key={i} className={`player-row ${p.connected ? 'connected' : 'empty'}`}>
              <span className="player-seat">Seat {p.seat}</span>
              <span className="player-user">{p.connected ? p.username : 'Waiting...'}</span>
              <span className="player-team">{p.team}</span>
            </div>
          ))}
        </div>

        <div className="waiting-footer">
          {isHost ? (
            <button
              className="btn-cafe primary"
              disabled={connectedCount < 4}
              onClick={onStart}
            >
              Start Game ({connectedCount}/4)
            </button>
          ) : (
            <p className="waiting-msg">Waiting for host to start...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomWaiting;
