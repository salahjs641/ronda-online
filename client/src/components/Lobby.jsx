import React, { useState } from 'react';

const Lobby = ({ onJoin, onCreate }) => {
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [view, setView] = useState('main'); // main, join, create

  return (
    <div className="lobby-overlay">
      <div className="lobby-glass">
        <h1 className="cafe-title">7bal u Bant</h1>
        <p className="cafe-subtitle">The Authentic Moroccan Experience</p>

        {view === 'main' && (
          <div className="lobby-actions">
            <button className="btn-cafe primary" onClick={() => setView('create')}>Create Room</button>
            <button className="btn-cafe secondary" onClick={() => setView('join')}>Join Room</button>
          </div>
        )}

        {(view === 'create' || view === 'join') && (
          <div className="lobby-form">
            <input
              type="text"
              placeholder="Your Name"
              className="cafe-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            {view === 'join' && (
              <input
                type="text"
                placeholder="Room Code"
                className="cafe-input"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
              />
            )}
            <div className="form-buttons">
              <button className="btn-cafe ghost" onClick={() => setView('main')}>Back</button>
              <button
                className="btn-cafe primary"
                onClick={() => view === 'create' ? onCreate(username) : onJoin(roomCode, username)}
              >
                {view === 'create' ? 'Open Café' : 'Grab a Seat'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Lobby;
