const mongoose = require('mongoose');

const CardSchema = new mongoose.Schema({
    suit: { type: String, enum: ['coins', 'cups', 'swords', 'clubs'], required: true },
    value: { type: Number, required: true },
    code: { type: String, required: true }
}, { _id: false });

const EffectSchema = new mongoose.Schema({
    type: { type: String, enum: ['SKIP', 'DRAW_STACK', 'SUIT_LOCK'], required: true },
    value: { type: mongoose.Schema.Types.Mixed },
    sourceSeat: { type: Number }
}, { _id: false });

const GameStateSchema = new mongoose.Schema({
    roomCode: { type: String, required: true, unique: true, index: true },
    deck: [CardSchema],
    tableCards: [CardSchema],
    discardPile: [CardSchema],
    currentPlayerIndex: { type: Number, default: 0 },
    requiredSuit: { type: String, default: null },
    skipCount: { type: Number, default: 0 },
    drawPenalty: { type: Number, default: 0 },
    effectQueue: [EffectSchema],
    roundNumber: { type: Number, default: 1 },
    state: { type: String, enum: ['active', 'ended', 'paused'], default: 'active' },
    waitingForSuit: { type: Boolean, default: false },
    suitSelector: { type: Number, default: null },
    lastCapturer: { type: Number, default: null },
    teamAScore: { type: Number, default: 0 },
    teamBScore: { type: Number, default: 0 },
    players: [{
        socketId: String,
        username: String,
        seat: Number,
        team: { type: String, enum: ['A', 'B'] },
        hand: [CardSchema],
        capturedCards: [CardSchema],
        score: { type: Number, default: 0 },
        bantCount: { type: Number, default: 0 },
        sevenbalCount: { type: Number, default: 0 }
    }]
}, { timestamps: true });

module.exports = mongoose.model('GameState', GameStateSchema);
