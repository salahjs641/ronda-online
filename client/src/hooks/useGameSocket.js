import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? 'https://ronda-online-production.up.railway.app'
    : 'http://localhost:3000';

const socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling']
});

export function useGameSocket() {
    const [gameState, setGameState] = useState(null);
    const [roomData, setRoomData] = useState(null);
    const [roomInfo, setRoomInfo] = useState({ roomCode: '', seat: null, team: '' });
    const [chatMessages, setChatMessages] = useState([]);
    const [lastEvent, setLastEvent] = useState(null);

    useEffect(() => {
        socket.on('game-state', (gs) => {
            console.log('Update Game State:', gs);
            setGameState(gs);
        });

        socket.on('room-update', (data) => {
            setRoomData(data);
        });

        socket.on('game-events', (data) => {
            console.log('Game event:', data);
            setLastEvent(data);
            // Clear event after 5 seconds
            setTimeout(() => setLastEvent(null), 5000);
        });

        socket.on('chat-message', (msg) => {
            setChatMessages(prev => [...prev.slice(-99), msg]); // Keep last 100
        });

        socket.on('game-started', () => {
            console.log('GAME STARTED');
        });

        socket.on('round-started', (data) => {
            console.log('ROUND STARTED:', data.round);
        });

        socket.on('player-disconnected', (data) => {
            console.log('Player disconnected:', data);
        });

        return () => {
            socket.off('game-state');
            socket.off('room-update');
            socket.off('game-events');
            socket.off('chat-message');
            socket.off('game-started');
            socket.off('round-started');
            socket.off('player-disconnected');
        };
    }, []);

    const createRoom = (username) => {
        return new Promise((resolve) => {
            socket.emit('create-room', { username }, (res) => {
                if (res.success) {
                    setRoomInfo({ roomCode: res.roomCode, seat: res.seat, team: res.team });
                }
                resolve(res);
            });
        });
    };

    const joinRoom = (roomCode, username) => {
        return new Promise((resolve) => {
            socket.emit('join-room', { roomCode, username }, (res) => {
                if (res.success) {
                    setRoomInfo({ roomCode, seat: res.seat, team: res.team });
                }
                resolve(res);
            });
        });
    };

    const playCard = (cardCode) => {
        return new Promise((resolve) => {
            socket.emit('play-card', { cardCode }, resolve);
        });
    };

    const announce = (type) => {
        return new Promise((resolve) => {
            socket.emit('announce-ronda', { type }, resolve);
        });
    };

    const skipAnnounce = () => {
        return new Promise((resolve) => {
            socket.emit('skip-announcing', null, resolve);
        });
    };

    const claimDfu3 = (type) => {
        return new Promise((resolve) => {
            socket.emit('claim-dfu3', { type }, resolve);
        });
    };

    const startGame = () => {
        return new Promise((resolve) => {
            socket.emit('start-game', null, resolve);
        });
    };

    const nextRound = () => {
        return new Promise((resolve) => {
            socket.emit('next-round', null, resolve);
        });
    };

    const sendChat = useCallback((text) => {
        socket.emit('chat-message', { text });
    }, []);

    return {
        socket,
        gameState,
        roomData,
        roomInfo,
        chatMessages,
        lastEvent,
        createRoom,
        joinRoom,
        startGame,
        nextRound,
        playCard,
        announce,
        skipAnnounce,
        claimDfu3,
        sendChat
    };
}
