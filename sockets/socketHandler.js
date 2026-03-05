/**
 * Socket.IO handler for Ronda Online.
 * Server-authoritative: clients only send playCard(cardCode) or claimDfu3(type).
 */

const engine = require('../game/engine');

const rooms = new Map();
const games = new Map();
const playerSockets = new Map();
const turnTimeouts = new Map();
const chainTimeouts = new Map();

function clearChainTimer(roomCode) {
    if (chainTimeouts.has(roomCode)) {
        clearTimeout(chainTimeouts.get(roomCode));
        chainTimeouts.delete(roomCode);
    }
}

function startChainTimer(io, roomCode) {
    clearChainTimer(roomCode);
    const gs = games.get(roomCode);
    if (!gs || gs.state !== 'active') return;

    const timeout = setTimeout(() => {
        const currentGs = games.get(roomCode);
        if (!currentGs || !currentGs.chainPending || !currentGs.chainPending.active) return;

        // Resolve the chain — give all cards to last capturer
        engine.resolveChain(currentGs);

        io.to(roomCode).emit('chat-message', {
            username: 'SYSTEM',
            text: `⛳ Chain resolved! Cards go to the last capturer.`,
            team: 'SYSTEM'
        });

        broadcastGameState(io, roomCode);
        persistState(roomCode);

        // Resume normal turn timer
        if (currentGs.state === 'active' && currentGs.phase === 'active') {
            startTurnTimer(io, roomCode);
        }
    }, 10000);

    chainTimeouts.set(roomCode, timeout);
}

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
                    if (result.captured.length > 0 || (result.events && result.events.length > 0)) {
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
                        startTurnTimer(io, roomCode);
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

            // Auto-resolve Ronda/Tringa then start turn timer
            autoResolveAndBroadcast(io, info.roomCode);
            startTurnTimer(io, info.roomCode);
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

            console.log(`🃏 Play: seat=${info.seat} card=${cardCode} captured=${result.captured.length} events=${result.events.length}`);

            // Broadcast capture events to ALL clients for animation
            if (result.captured.length > 0 || result.events.length > 0) {
                console.log(`📡 Emitting game-events: captured=${result.captured.map(c => c.code).join(',')}`);

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

            // Handle chain window timer
            if (result.chainActive) {
                // Bant/Hbal chain started — pause turn timer, start chain timer
                clearTurnTimer(info.roomCode);
                startChainTimer(io, info.roomCode);
            } else if (gs.state === 'active') {
                // Normal play — clear any chain timer, start turn timer
                clearChainTimer(info.roomCode);
                startTurnTimer(io, info.roomCode);
            } else {
                clearTurnTimer(info.roomCode);
                clearChainTimer(info.roomCode);
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



        // ─── NEXT ROUND ─────────────────────────────
        socket.on('next-round', (_, callback) => {
            const info = playerSockets.get(socket.id);
            if (!info) return callback({ success: false, error: 'Not in a room' });
            const gs = games.get(info.roomCode);
            if (!gs) return callback({ success: false, error: 'No active game' });

            engine.startNewRound(gs);
            broadcastGameState(io, info.roomCode);
            persistState(info.roomCode);
            autoResolveAndBroadcast(io, info.roomCode);
            startTurnTimer(io, info.roomCode);
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

function autoResolveAndBroadcast(io, roomCode) {
    const gs = games.get(roomCode);
    if (!gs) return;
    const events = engine.autoResolveAnnouncements(gs);
    for (const evt of events) {
        io.to(roomCode).emit('chat-message', {
            username: 'SYSTEM',
            text: evt.description,
            team: 'SYSTEM'
        });
    }
    broadcastGameState(io, roomCode);
    persistState(roomCode);
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
