/**
 * Socket.IO handler for Ronda Online.
 * Server-authoritative: clients only send playCard(cardCode) or claimDfu3(type).
 */

const engine = require('../game/engine');

const rooms = new Map();
const games = new Map();
const playerSockets = new Map();
const announceTimeouts = new Map();
const turnTimeouts = new Map();

function clearTurnTimer(roomCode) {
    if (turnTimeouts.has(roomCode)) {
        clearTimeout(turnTimeouts.get(roomCode));
        turnTimeouts.delete(roomCode);
    }
}

function startTurnTimer(io, roomCode) {
    clearTurnTimer(roomCode);
    const gs = games.get(roomCode);
    if (!gs || gs.state !== 'active' || gs.phase !== 'active') return;

    gs.turnExpiresAt = Date.now() + 15000;

    const timeout = setTimeout(() => {
        const currentGs = games.get(roomCode);
        if (currentGs && currentGs.state === 'active' && currentGs.phase === 'active') {
            const currentSeat = currentGs.players[currentGs.currentPlayerIndex].seat;
            const player = currentGs.players.find(p => p.seat === currentSeat);
            if (player && player.hand.length > 0) {
                const randomCardCode = player.hand[Math.floor(Math.random() * player.hand.length)].code;
                const result = engine.playCard(currentGs, player.seat, randomCardCode);

                if (result.success) {
                    if (result.events && result.events.length > 0) {
                        io.to(roomCode).emit('game-events', {
                            player: result.playedBy.username,
                            card: result.card,
                            events: result.events,
                            captured: result.captured,
                            bantEarned: result.bantEarned,
                            hbalEarned: result.hbalEarned,
                            seat: result.playedBy.seat
                        });
                    }
                    io.to(roomCode).emit('chat-message', {
                        username: 'SYSTEM',
                        text: `${player.username} played a card automatically (timeout).`,
                        team: 'SYSTEM'
                    });

                    // Start next timer
                    if (currentGs.state === 'active') {
                        if (currentGs.phase === 'announcing') {
                            startAnnounceTimer(io, roomCode);
                        } else {
                            startTurnTimer(io, roomCode);
                        }
                    } else {
                        clearTurnTimer(roomCode);
                    }

                    broadcastGameState(io, roomCode);
                    persistState(roomCode);
                }
            }
        }
        turnTimeouts.delete(roomCode);
    }, 15000);
    turnTimeouts.set(roomCode, timeout);
}

let GameStateModel = null;
try {
    const mongoose = require('mongoose');
    mongoose.connection.on('connected', () => {
        GameStateModel = require('../models/GameState');
    });
    if (mongoose.connection.readyState === 1) {
        GameStateModel = require('../models/GameState');
    }
} catch (e) { }

function generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function persistState(roomCode) {
    if (!GameStateModel) return;
    try {
        const gs = games.get(roomCode);
        if (!gs) return;
        await GameStateModel.findOneAndUpdate({ roomCode }, { ...gs, roomCode }, { upsert: true, new: true });
    } catch (e) { console.warn('⚠️ Persist failed:', e.message); }
}

function setupSocketHandlers(io) {
    io.on('connection', (socket) => {
        console.log(`🔌 Connected: ${socket.id}`);

        // ─── CREATE ROOM ────────────────────────────
        socket.on('create-room', ({ username }, callback) => {
            const roomCode = generateRoomCode();
            const room = {
                roomCode, status: 'waiting', host: socket.id,
                players: [
                    { socketId: socket.id, username, seat: 1, team: 'A', connected: true },
                    { socketId: null, username: null, seat: 2, team: 'B', connected: false },
                    { socketId: null, username: null, seat: 3, team: 'A', connected: false },
                    { socketId: null, username: null, seat: 4, team: 'B', connected: false }
                ]
            };
            rooms.set(roomCode, room);
            playerSockets.set(socket.id, { roomCode, seat: 1 });
            socket.join(roomCode);
            callback({ success: true, roomCode, seat: 1, team: 'A' });
            io.to(roomCode).emit('room-update', sanitizeRoom(room));
            console.log(`🏠 Room ${roomCode} created by ${username}`);
        });

        // ─── JOIN ROOM ──────────────────────────────
        socket.on('join-room', ({ roomCode, username }, callback) => {
            const code = roomCode.toUpperCase();
            const room = rooms.get(code);
            if (!room) return callback({ success: false, error: 'Room not found' });
            if (room.status !== 'waiting') return callback({ success: false, error: 'Game already in progress' });
            const slot = room.players.find(p => !p.connected);
            if (!slot) return callback({ success: false, error: 'Room is full' });
            slot.socketId = socket.id;
            slot.username = username;
            slot.connected = true;
            playerSockets.set(socket.id, { roomCode: code, seat: slot.seat });
            socket.join(code);
            callback({ success: true, roomCode: code, seat: slot.seat, team: slot.team });
            io.to(code).emit('room-update', sanitizeRoom(room));
            console.log(`👤 ${username} joined ${code} (seat ${slot.seat})`);
        });

        // ─── START GAME ─────────────────────────────
        socket.on('start-game', (_, callback) => {
            const info = playerSockets.get(socket.id);
            if (!info) return callback({ success: false, error: 'Not in a room' });
            const room = rooms.get(info.roomCode);
            if (!room) return callback({ success: false, error: 'Room not found' });
            if (room.host !== socket.id) return callback({ success: false, error: 'Only host can start' });
            const connected = room.players.filter(p => p.connected).length;
            if (connected < 4) return callback({ success: false, error: `Need 4 players (have ${connected})` });

            room.status = 'playing';
            const gs = engine.initMatch(room.players);
            games.set(info.roomCode, gs);
            broadcastGameState(io, info.roomCode);
            persistState(info.roomCode);
            callback({ success: true });
            io.to(info.roomCode).emit('game-started');

            startAnnounceTimer(io, info.roomCode);
            console.log(`🎮 Game started in ${info.roomCode}`);
        });

        // ─── PLAY CARD ──────────────────────────────
        socket.on('play-card', ({ cardCode }, callback) => {
            const info = playerSockets.get(socket.id);
            if (!info) return callback({ success: false, error: 'Not in a room' });
            const gs = games.get(info.roomCode);
            if (!gs) return callback({ success: false, error: 'No active game' });

            const result = engine.playCard(gs, info.seat, cardCode);
            if (!result.success) return callback(result);

            // Broadcast events (Bant, Hbal, etc.)
            if (result.events.length > 0) {
                io.to(info.roomCode).emit('game-events', {
                    player: result.playedBy.username,
                    card: result.card,
                    events: result.events,
                    captured: result.captured,
                    bantEarned: result.bantEarned,
                    hbalEarned: result.hbalEarned,
                    seat: result.playedBy.seat
                });
            }

            broadcastGameState(io, info.roomCode);
            persistState(info.roomCode);
            callback({ success: true });

            if (gs.state === 'active') {
                if (gs.phase === 'announcing') {
                    startAnnounceTimer(io, info.roomCode);
                } else {
                    startTurnTimer(io, info.roomCode);
                }
            } else {
                clearTurnTimer(info.roomCode);
            }
        });

        // ─── CLAIM DFU3 ─────────────────────────────
        socket.on('claim-dfu3', ({ type }, callback) => {
            const info = playerSockets.get(socket.id);
            if (!info) return callback({ success: false, error: 'Not in a room' });
            const gs = games.get(info.roomCode);
            if (!gs) return callback({ success: false, error: 'No active game' });

            const result = engine.claimDfu3(gs, info.seat, type);
            if (!result.success) return callback(result);

            io.to(info.roomCode).emit('dfu3-claimed', {
                type: result.type,
                team: result.team,
                gameOver: result.gameOver || false
            });

            broadcastGameState(io, info.roomCode);
            persistState(info.roomCode);
            callback({ success: true, type: result.type });
        });

        // ─── ANNOUNCE RONDA / TRINGA ─────────────────
        socket.on('announce-ronda', ({ type }, callback) => {
            const info = playerSockets.get(socket.id);
            if (!info) return callback({ success: false, error: 'Not in a room' });
            const gs = games.get(info.roomCode);
            if (!gs) return callback({ success: false, error: 'No active game' });

            const result = engine.announce(gs, info.seat, type);
            if (!result.success) return callback(result);

            io.to(info.roomCode).emit('chat-message', {
                username: 'SYSTEM',
                text: `${result.username} announced ${type}!`,
                team: 'SYSTEM'
            });

            checkAnnouncementPhase(io, info.roomCode);
            callback({ success: true });
        });

        socket.on('skip-announcing', (_, callback) => {
            const info = playerSockets.get(socket.id);
            if (!info) return callback({ success: false, error: 'Not in a room' });
            const gs = games.get(info.roomCode);
            if (!gs) return callback({ success: false, error: 'No active game' });

            const result = engine.skipAnnounce(gs, info.seat);
            if (!result.success) return callback(result);

            checkAnnouncementPhase(io, info.roomCode);
            callback({ success: true });
        });

        // ─── NEXT ROUND ─────────────────────────────
        socket.on('next-round', (_, callback) => {
            const info = playerSockets.get(socket.id);
            if (!info) return callback({ success: false, error: 'Not in a room' });
            const gs = games.get(info.roomCode);
            if (!gs) return callback({ success: false, error: 'No active game' });

            engine.startNewRound(gs);
            broadcastGameState(io, info.roomCode);
            persistState(info.roomCode);
            startAnnounceTimer(io, info.roomCode);
            io.to(info.roomCode).emit('round-started', { round: gs.roundNumber });
            callback({ success: true });
        });

        // ─── CHAT MESSAGE ───────────────────────────
        socket.on('chat-message', ({ text }) => {
            const info = playerSockets.get(socket.id);
            if (!info) return;
            const room = rooms.get(info.roomCode);
            if (!room) return;
            const player = room.players.find(p => p.socketId === socket.id);
            if (!player) return;
            io.to(info.roomCode).emit('chat-message', {
                username: player.username,
                team: player.team,
                text: text.substring(0, 200),
                seat: player.seat
            });
        });

        // ─── DISCONNECT ─────────────────────────────
        socket.on('disconnect', () => {
            const info = playerSockets.get(socket.id);
            if (info) {
                const room = rooms.get(info.roomCode);
                if (room) {
                    const player = room.players.find(p => p.socketId === socket.id);
                    if (player) {
                        player.connected = false;
                        console.log(`❌ ${player.username} disconnected from ${info.roomCode}`);
                        io.to(info.roomCode).emit('room-update', sanitizeRoom(room));
                        io.to(info.roomCode).emit('player-disconnected', { seat: player.seat, username: player.username });
                    }
                }
                playerSockets.delete(socket.id);
            }
        });
    });
}

function startAnnounceTimer(io, roomCode) {
    // Clear existing timer if any
    if (announceTimeouts.has(roomCode)) {
        clearTimeout(announceTimeouts.get(roomCode));
    }

    // Set a 15-second timeout for the announcement phase
    const timeout = setTimeout(() => {
        const gs = games.get(roomCode);
        if (gs && gs.phase === 'announcing') {
            engine.forceSkipAnnouncing(gs);
            startTurnTimer(io, roomCode);
            broadcastGameState(io, roomCode);
            io.to(roomCode).emit('chat-message', {
                username: 'SYSTEM',
                text: `Announcement phase timed out.`,
                team: 'SYSTEM'
            });
        }
        announceTimeouts.delete(roomCode);
    }, 15000);

    announceTimeouts.set(roomCode, timeout);
}

function checkAnnouncementPhase(io, roomCode) {
    const gs = games.get(roomCode);
    if (!gs) return;

    // The engine's checkAnnouncingComplete already advances the phase if everyone is done.
    // So we just need to broadcast the state.
    broadcastGameState(io, roomCode);

    if (gs.phase === 'active' && announceTimeouts.has(roomCode)) {
        clearTimeout(announceTimeouts.get(roomCode));
        announceTimeouts.delete(roomCode);
        startTurnTimer(io, roomCode);
    }
}

function broadcastGameState(io, roomCode) {
    const gs = games.get(roomCode);
    const room = rooms.get(roomCode);
    if (!gs || !room) return;
    for (const p of room.players) {
        if (p.connected && p.socketId) {
            io.to(p.socketId).emit('game-state', engine.getPlayerView(gs, p.seat));
        }
    }
}

function sanitizeRoom(room) {
    return {
        roomCode: room.roomCode, status: room.status, host: room.host,
        players: room.players.map(p => ({ seat: p.seat, team: p.team, username: p.username, connected: p.connected }))
    };
}

module.exports = { setupSocketHandlers };
