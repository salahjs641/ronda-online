const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
    suit: { type: String, enum: ['coins', 'cups', 'swords', 'clubs'], required: true },
    value: { type: Number, required: true },
    code: { type: String, required: true }
}, { _id: false });

const playerStateSchema = new mongoose.Schema({
    matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
    socketId: { type: String, default: '' },
    username: { type: String, default: '' },
    seat: { type: Number, required: true },
    team: { type: String, enum: ['A', 'B'], required: true },
    hand: { type: [cardSchema], default: [] },
    capturedCards: { type: [cardSchema], default: [] },
    score: { type: Number, default: 0 },
    bantCount: { type: Number, default: 0 },
    sevenbalCount: { type: Number, default: 0 }
});

module.exports = mongoose.model('PlayerState', playerStateSchema);
