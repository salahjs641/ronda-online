const mongoose = require('mongoose');

const playerSlotSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    username: { type: String, default: '' },
    seat: { type: Number, required: true },
    team: { type: String, enum: ['A', 'B'], required: true },
    connected: { type: Boolean, default: false },
    socketId: { type: String, default: '' }
}, { _id: false });

const roomSchema = new mongoose.Schema({
    roomCode: { type: String, required: true, unique: true },
    status: { type: String, enum: ['waiting', 'playing', 'finished'], default: 'waiting' },
    hostSocketId: { type: String, default: '' },
    players: {
        type: [playerSlotSchema],
        default: [
            { seat: 1, team: 'A' },
            { seat: 2, team: 'B' },
            { seat: 3, team: 'A' },
            { seat: 4, team: 'B' }
        ]
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Room', roomSchema);
