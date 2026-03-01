const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
    suit: { type: String, enum: ['coins', 'cups', 'swords', 'clubs'], required: true },
    value: { type: Number, required: true },
    code: { type: String, required: true }
}, { _id: false });

const matchSchema = new mongoose.Schema({
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    currentPlayerIndex: { type: Number, default: 0 },
    requiredSuit: { type: String, default: null },
    skipCount: { type: Number, default: 0 },
    drawPenalty: { type: Number, default: 0 },
    deck: { type: [cardSchema], default: [] },
    discardPile: { type: [cardSchema], default: [] },
    tableCards: { type: [cardSchema], default: [] },
    roundNumber: { type: Number, default: 1 },
    state: { type: String, enum: ['active', 'ended'], default: 'active' },
    teamAScore: { type: Number, default: 0 },
    teamBScore: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Match', matchSchema);
