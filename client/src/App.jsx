import React, { useState, useEffect } from 'react';
import './index.css';
import { useGameSocket } from './hooks/useGameSocket';
import GameScene from './components/3d/GameScene';
import GameHUD from './components/3d/GameHUD';
import ChatBox from './components/ChatBox';
import Lobby from './components/Lobby';
import RoomWaiting from './components/RoomWaiting';

function App() {
  const {
    gameState,
    roomData,
    roomInfo,
    chatMessages,
    lastEvent,
    joinRoom,
    createRoom,
    startGame,
    nextRound,
    playCard,
    announce,
    skipAnnounce,
    claimDfu3,
    sendChat
  } = useGameSocket();

  const [view, setView] = useState('lobby');

  useEffect(() => {
    if (gameState) setView('table');
    else if (roomData) setView('waiting');
  }, [gameState, roomData]);

  const handleCreated = async (username) => {
    const res = await createRoom(username);
    if (res.success) setView('waiting');
  };

  const handleJoined = async (roomCode, username) => {
    const res = await joinRoom(roomCode, username);
    if (res.success) setView('waiting');
  };

  return (
    <div className="cafe-environment">
      <div className="ambient-light" />

      {view === 'lobby' && (
        <Lobby onJoin={handleJoined} onCreate={handleCreated} />
      )}

      {view === 'waiting' && (
        <RoomWaiting
          roomData={roomData}
          roomInfo={roomInfo}
          onStart={startGame}
        />
      )}

      {view === 'table' && (
        <>
          {/* 3D World */}
          <GameScene
            gameState={gameState}
            roomInfo={roomInfo}
            onPlayCard={playCard}
            lastEvent={lastEvent}
          />

          {/* HTML Overlays on top of 3D */}
          <GameHUD
            gameState={gameState}
            roomInfo={roomInfo}
            onAnnounce={announce}
            onSkipAnnounce={skipAnnounce}
            onClaimDfu3={claimDfu3}
            onNextRound={nextRound}
          />

          <ChatBox messages={chatMessages} onSend={sendChat} />
        </>
      )}
    </div>
  );
}

export default App;
