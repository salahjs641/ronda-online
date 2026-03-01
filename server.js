require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const { setupSocketHandlers } = require('./sockets/socketHandler');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"],
        credentials: true
    },
    allowEIO3: true, // Help with older client fallback
    pingTimeout: 60000,
});

// Serve static files — card images & other assets
app.use(express.static(path.join(__dirname, 'public')));
// Serve built frontend
app.use(express.static(path.join(__dirname, 'client', 'dist')));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', game: 'Ronda Online' });
});

// Setup Socket.IO
setupSocketHandlers(io);

// SPA fallback — serve index.html for any unmatched route
app.get('*', (req, res) => {
    const indexPath = path.join(__dirname, 'client', 'dist', 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('Build not found. Run: cd client && npm run build');
    }
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ronda';

async function start() {
    server.listen(PORT, () => {
        console.log(`\n🃏 ═══════════════════════════════════════`);
        console.log(`   RONDA ONLINE — Moroccan Card Game`);
        console.log(`   Server running on http://localhost:${PORT}`);
        console.log(`🃏 ═══════════════════════════════════════\n`);
    });

    try {
        await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
        console.log('📦 Connected to MongoDB');
    } catch (err) {
        console.warn('⚠️  MongoDB not available — using in-memory storage');
    }
}

start();
