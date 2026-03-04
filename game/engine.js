/**
 * RONDA — Moroccan Card Game Engine
 *
 * RULES:
 *   - 40-card Baraja deck, 4 suits, values 1-7,10-12
 *   - 4 players, 2 teams (A: seats 1,3 / B: seats 2,4)
 *   - Deal 4 cards each + 4 on table (first deal only)
 *   - Re-deal 4 more when hands empty, until deck exhausted
 *   - Capture by rank match + ascending sequence
 *   - Scoring: Bant (opponent capture, missa, este) / Hbal (teammate capture, 4th card)
 *   - Card count at round end: team > 20 cards gets (count-20) Bant
 *   - Dfu3 Kbir: 4 Hbal + 2 Bant → Dfu3 Sghir: 3 Hbal + 4 Bant → WIN
 */

const { createDeck, shuffle, deal } = require('./deck');

const CARDS_PER_DEAL = 3;
const TABLE_CARDS_INITIAL = 4;
const RANK_ORDER = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];

function getRankIndex(value) {
    return RANK_ORDER.indexOf(value);
}

// ═══════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════

function initMatch(players) {
    const deck = shuffle(createDeck());

    const playerStates = players.map(p => ({
        socketId: p.socketId,
        username: p.username,
        seat: p.seat,
        team: p.team,
        hand: deal(deck, CARDS_PER_DEAL),
        capturedCards: [],
        _fourthAwarded: new Set(),
    }));

    let tableCards = dealValidTableCards(deck);

    return {
        deck,
        tableCards,
        currentPlayerIndex: 0,
        roundNumber: 1,
        dealNumber: 1,
        state: 'active',
        players: playerStates,
        teamA: { bant: 0, hbal: 0, dfu3Kbir: false, dfu3Sghir: false },
        teamB: { bant: 0, hbal: 0, dfu3Kbir: false, dfu3Sghir: false },
        winner: null,
        lastCapturer: null,
        lastPlayedCard: null,
        lastPlayedBySeat: null,
        phase: 'announcing',
        announcements: {},
        announceDone: {},  // Track who has decided (announced or skipped)
        lastAction: null,  // For client display
        cardCount: null,
    };
}

function dealValidTableCards(deck) {
    let attempts = 0;
    while (attempts < 10) {
        const cards = deal(deck, TABLE_CARDS_INITIAL).map(c => ({
            ...c, playedBySeat: null, playedByTeam: null
        }));
        const ranks = cards.map(c => c.value);
        const hasPair = ranks.some((r, i) => ranks.indexOf(r) !== i);
        const rankIndices = ranks.map(r => getRankIndex(r)).sort((a, b) => a - b);
        const is4Sequence = rankIndices.every((v, i) =>
            i === 0 || v === rankIndices[i - 1] + 1
        );
        if (!hasPair && !is4Sequence) return cards;
        for (const c of cards) {
            deck.push({ suit: c.suit, value: c.value, code: c.code });
        }
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        attempts++;
    }
    return deal(deck, TABLE_CARDS_INITIAL).map(c => ({
        ...c, playedBySeat: null, playedByTeam: null
    }));
}

// ═══════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════

function getCurrentPlayer(gs) {
    return gs.players[gs.currentPlayerIndex];
}

function getPlayerBySeat(gs, seat) {
    return gs.players.find(p => p.seat === seat);
}

function getTeamData(gs, team) {
    return team === 'A' ? gs.teamA : gs.teamB;
}

function advanceTurn(gs) {
    gs.currentPlayerIndex = (gs.currentPlayerIndex + 1) % 4;
}

// ═══════════════════════════════════════════
//  ASCENDING SEQUENCE FINDER
// ═══════════════════════════════════════════

function findAscendingSequence(matchedRank, tableCards) {
    const sequenceIndices = [];
    let currentRankIdx = getRankIndex(matchedRank);
    while (true) {
        currentRankIdx++;
        if (currentRankIdx >= RANK_ORDER.length) break;
        const nextRank = RANK_ORDER[currentRankIdx];
        const foundIdx = tableCards.findIndex((c, i) =>
            c.value === nextRank && !sequenceIndices.includes(i)
        );
        if (foundIdx === -1) break;
        sequenceIndices.push(foundIdx);
    }
    return sequenceIndices;
}

// ═══════════════════════════════════════════
//  ANNOUNCE / SKIP
// ═══════════════════════════════════════════

function announce(gs, seatNumber, type) {
    if (gs.phase !== 'announcing') return { success: false, error: 'Not announcing phase' };
    if (gs.announceDone[seatNumber]) return { success: false, error: 'Already decided' };

    const player = getPlayerBySeat(gs, seatNumber);
    if (!player) return { success: false, error: 'Player not found' };

    const counts = {};
    player.hand.forEach(c => counts[c.value] = (counts[c.value] || 0) + 1);
    const max = Math.max(...Object.values(counts));

    if (type === 'ronda' && max < 2) return { success: false, error: 'No pair found' };
    if (type === 'tringa' && max < 3) return { success: false, error: 'No trio found' };

    gs.announcements[seatNumber] = type;
    gs.announceDone[seatNumber] = true;

    // Check if all players have decided
    checkAnnouncingComplete(gs);

    return { success: true, type, username: player.username, seat: seatNumber };
}

function skipAnnounce(gs, seatNumber) {
    if (gs.phase !== 'announcing') return { success: false, error: 'Not announcing phase' };
    if (gs.announceDone[seatNumber]) return { success: false, error: 'Already decided' };

    gs.announceDone[seatNumber] = true;

    // Check if all players have decided
    checkAnnouncingComplete(gs);

    const player = getPlayerBySeat(gs, seatNumber);
    return { success: true, username: player?.username, seat: seatNumber };
}

function checkAnnouncingComplete(gs) {
    const allDone = gs.players.every(p => gs.announceDone[p.seat]);
    if (allDone) {
        // Resolve announcements
        verifyAnnouncements(gs);
        gs.phase = 'active';
    }
}

function forceSkipAnnouncing(gs) {
    // Force end announcing (timeout)
    verifyAnnouncements(gs);
    gs.phase = 'active';
    gs.announceDone = {};
}

function verifyAnnouncements(gs) {
    const seats = Object.keys(gs.announcements).map(Number);
    if (seats.length === 0) return;

    let bestSeat = -1;
    let bestType = '';
    let bestRankIdx = -1;

    for (const seat of seats) {
        const type = gs.announcements[seat];
        const player = getPlayerBySeat(gs, seat);
        const counts = {};
        player.hand.forEach(c => counts[c.value] = (counts[c.value] || 0) + 1);

        let targetCount = (type === 'tringa' ? 3 : 2);
        let rank = -1;
        for (const [r, c] of Object.entries(counts)) {
            if (c >= targetCount) rank = parseInt(r);
        }
        const rankIdx = getRankIndex(rank);

        if (bestType === '') {
            bestSeat = seat; bestType = type; bestRankIdx = rankIdx;
        } else if (type === 'tringa' && bestType === 'ronda') {
            bestSeat = seat; bestType = type; bestRankIdx = rankIdx;
        } else if (type === bestType && rankIdx > bestRankIdx) {
            bestSeat = seat; bestType = type; bestRankIdx = rankIdx;
        }
    }

    if (bestSeat !== -1) {
        let totalPoints = 0;
        for (const s of seats) {
            const t = gs.announcements[s];
            totalPoints += (t === 'tringa' ? 5 : 1);
        }
        const winner = getPlayerBySeat(gs, bestSeat);
        const teamData = getTeamData(gs, winner.team);
        teamData.bant += totalPoints;
    }

    gs.announcements = {};
    gs.announceDone = {};
}

// ═══════════════════════════════════════════
//  RESOLVE CHAIN (called by timer or when chain breaks)
// ═══════════════════════════════════════════

function resolveChain(gs) {
    if (!gs.chainPending || !gs.chainPending.active) return;

    const capturer = getPlayerBySeat(gs, gs.chainPending.lastCapturerSeat);
    if (capturer) {
        // Remove ALL chain cards from the table
        const chainCodes = new Set(gs.chainPending.cards.map(c => c.code));
        const removedCards = gs.tableCards.filter(c => chainCodes.has(c.code));
        gs.tableCards = gs.tableCards.filter(c => !chainCodes.has(c.code));

        // Give all chain cards to the last capturer
        capturer.capturedCards.push(...gs.chainPending.cards);
        gs.lastCapturer = capturer.seat;

        // Store capture info for animation
        gs.lastCapture = {
            card: gs.chainPending.cards[gs.chainPending.cards.length - 1],
            captured: gs.chainPending.cards,
            seat: capturer.seat,
            timestamp: Date.now(),
            chainCount: gs.chainPending.count,
            isChainResolve: true
        };
    }

    // Clear chain state
    gs.chainPending = null;
    gs.captureChain = { active: false, value: null, count: 0 };
    gs.chainWindowExpiresAt = null;
    if (gs.phase === 'chain_window') gs.phase = 'active';
}

// ═══════════════════════════════════════════
//  PLAY CARD
// ═══════════════════════════════════════════

function playCard(gs, seatNumber, cardCode) {
    const player = getPlayerBySeat(gs, seatNumber);
    if (!player) return { success: false, error: 'Player not found' };

    const current = getCurrentPlayer(gs);
    if (current.seat !== seatNumber) return { success: false, error: 'Not your turn' };
    if (gs.state !== 'active') return { success: false, error: 'Game not active' };
    if (gs.phase === 'announcing') return { success: false, error: 'Wait for announcements' };
    // Allow playing during chain_window phase (that's the whole point)

    const cardIndex = player.hand.findIndex(c => c.code === cardCode);
    if (cardIndex === -1) return { success: false, error: 'Card not in your hand' };

    const card = player.hand.splice(cardIndex, 1)[0];

    // Clear previous capture before processing
    gs.lastCapture = null;

    const result = {
        success: true, card,
        playedBy: { seat: player.seat, username: player.username, team: player.team },
        captured: [], bantEarned: 0, hbalEarned: 0, events: [], tableCleared: false,
    };

    // ── Resolve any pending chain if player plays a different value ──
    if (gs.chainPending && gs.chainPending.active && card.value !== gs.chainPending.value) {
        resolveChain(gs);
    }

    // 1. Direct match capture + ascending sequence
    const matchIndex = gs.tableCards.findIndex(c => c.value === card.value);

    if (!gs.captureChain) {
        gs.captureChain = { active: false, value: null, count: 0 };
    }

    if (matchIndex !== -1) {
        const matchedCard = gs.tableCards[matchIndex];
        const remainingCards = gs.tableCards.filter((_, i) => i !== matchIndex);

        const isBant = gs.lastPlayedCard
            && gs.lastPlayedCard.value === card.value
            && gs.lastPlayedBySeat !== player.seat;

        const isChainContinuation = gs.chainPending && gs.chainPending.active
            && gs.chainPending.value === card.value;

        if (isChainContinuation) {
            // ═══ CHAIN CONTINUATION (Hbal) ═══
            gs.chainPending.count++;
            gs.captureChain.count = gs.chainPending.count;
            gs.chainPending.lastCapturerSeat = player.seat;
            gs.chainPending.lastCapturerTeam = player.team;

            // Add both cards to chain pending
            gs.chainPending.cards.push(
                { suit: matchedCard.suit, value: matchedCard.value, code: matchedCard.code },
                { suit: card.suit, value: card.value, code: card.code }
            );

            // Remove matched card, add played card to table (for display)
            gs.tableCards = remainingCards;
            gs.tableCards.push({ ...card, playedBySeat: player.seat, playedByTeam: player.team, isChainCard: true });

            if (gs.chainPending.count === 3) {
                getTeamData(gs, player.team).hbal += 1;
                result.hbalEarned += 1;
                result.events.push({ type: 'HBAL', description: `${player.username} kept the chain going! (1 Hbal)` });
            } else if (gs.chainPending.count >= 4) {
                getTeamData(gs, player.team).hbal += 2;
                result.hbalEarned += 2;
                result.events.push({ type: 'HBAL', description: `${player.username} finished the chain! (2 Hbal)` });
            }

            gs.phase = 'chain_window';
            gs.chainWindowExpiresAt = Date.now() + 10000;
            result.chainActive = true;
            gs.lastCapturer = player.seat;

        } else if (isBant) {
            // ═══ NEW BANT — cards stay on table, 10s window ═══
            gs.captureChain = { active: true, value: card.value, count: 2 };
            getTeamData(gs, player.team).bant += 1;
            result.bantEarned += 1;
            result.events.push({ type: 'BANT', description: `${player.username} hit the card! (1 Bant)` });

            // Both cards stay on table — stored in chainPending
            gs.chainPending = {
                active: true,
                value: card.value,
                count: 2,
                lastCapturerSeat: player.seat,
                lastCapturerTeam: player.team,
                cards: [
                    { suit: matchedCard.suit, value: matchedCard.value, code: matchedCard.code },
                    { suit: card.suit, value: card.value, code: card.code }
                ]
            };

            // Mark matched card, add played card to table
            const mIdx = gs.tableCards.findIndex(c => c.code === matchedCard.code);
            if (mIdx !== -1) gs.tableCards[mIdx].isChainCard = true;
            gs.tableCards.push({ ...card, playedBySeat: player.seat, playedByTeam: player.team, isChainCard: true });

            gs.phase = 'chain_window';
            gs.chainWindowExpiresAt = Date.now() + 10000;
            result.chainActive = true;
            gs.lastCapturer = player.seat;

        } else {
            // ═══ NORMAL CAPTURE ═══
            gs.captureChain = { active: false, value: null, count: 0 };

            const seqIndices = findAscendingSequence(card.value, remainingCards);
            const capturedCards = [matchedCard];
            capturedCards.push(...seqIndices.map(i => remainingCards[i]));

            const capturedCodes = new Set(capturedCards.map(c => c.code));
            gs.tableCards = gs.tableCards.filter(c => !capturedCodes.has(c.code));

            player.capturedCards.push(card, ...capturedCards.map(c => ({ suit: c.suit, value: c.value, code: c.code })));
            result.captured = capturedCards;
            gs.lastCapturer = player.seat;

            gs.lastCapture = {
                card: { suit: card.suit, value: card.value, code: card.code },
                captured: capturedCards.map(c => ({ suit: c.suit, value: c.value, code: c.code })),
                seat: player.seat,
                timestamp: Date.now(),
                chainCount: 0
            };
        }

        // Missa check (only non-chain)
        if (!result.chainActive && result.captured.length > 0 && gs.tableCards.length === 0) {
            getTeamData(gs, player.team).bant += 1;
            result.bantEarned += 1;
            result.tableCleared = true;
            result.events.push({ type: 'BANT', description: `Missa! ${player.username} cleared the table (1 Bant)` });
        }

    } else {
        // No match — resolve any active chain, drop card on table
        if (gs.chainPending && gs.chainPending.active) {
            resolveChain(gs);
        }
        gs.captureChain = { active: false, value: null, count: 0 };
        gs.tableCards.push({ ...card, playedBySeat: player.seat, playedByTeam: player.team });
    }

    // Keep track of last played card
    gs.lastPlayedCard = card;
    gs.lastPlayedBySeat = player.seat;

    // Check Win Condition (8 Hbal)
    const teamObj = getTeamData(gs, player.team);
    const convertedHbal = Math.floor(teamObj.bant / 6);
    const totalHbal = teamObj.hbal + convertedHbal;

    if (totalHbal >= 8) {
        gs.winner = player.team;
        gs.state = 'ended';
        result.events.push({ type: 'WIN', description: `Team ${player.team} reached 8 Hbal and WINS!` });
    }

    gs.lastAction = {
        seat: player.seat, username: player.username,
        card: { suit: card.suit, value: card.value, code: card.code },
        captured: result.captured.length,
        events: result.events.map(e => e.description).filter(Boolean),
    };

    if (gs.state === 'ended') return result;

    advanceTurn(gs);

    if (gs.players.every(p => p.hand.length === 0)) {
        if (gs.deck.length > 0) {
            dealNewHands(gs);
            gs.dealNumber++;
            gs.lastPlayedCard = null;
            gs.lastPlayedBySeat = null;
            gs.captureChain = { active: false, value: null, count: 0 };
            result.events.push({ type: 'NEW_DEAL', description: 'New cards dealt!' });
        } else {
            endRound(gs);
            result.events.push({ type: 'ROUND_END', description: 'Round over!' });
        }
    }
    return result;
}

function checkFourthCard(gs, player, result) {
    const teamPlayers = gs.players.filter(p => p.team === player.team);
    const rankCounts = {};
    for (const tp of teamPlayers) {
        for (const c of tp.capturedCards) {
            rankCounts[c.value] = (rankCounts[c.value] || 0) + 1;
        }
    }
    for (const [rank, count] of Object.entries(rankCounts)) {
        if (count >= 4 && !player._fourthAwarded.has(rank)) {
            player._fourthAwarded.add(rank);
            getTeamData(gs, player.team).hbal++;
            result.hbalEarned = true;
            result.events.push({ type: 'HBAL', reason: 'fourth_card', rank: parseInt(rank), description: `All four ${rank}s captured!` });
        }
    }
}

// ═══════════════════════════════════════════
//  DFU3 CLAIMS
// ═══════════════════════════════════════════

function claimDfu3(gs, seatNumber, type) {
    const player = getPlayerBySeat(gs, seatNumber);
    if (!player) return { success: false, error: 'Player not found' };
    const teamData = getTeamData(gs, player.team);

    if (type === 'kbir') {
        if (teamData.dfu3Kbir) return { success: false, error: 'Already claimed' };
        if (teamData.hbal >= 4 && teamData.bant >= 2) {
            teamData.dfu3Kbir = true;
            return { success: true, type: 'kbir', team: player.team };
        }
        return { success: false, error: 'Need 4 Hbal + 2 Bant' };
    }

    if (type === 'sghir') {
        if (!teamData.dfu3Kbir) return { success: false, error: 'Must claim Kbir first' };
        if (teamData.dfu3Sghir) return { success: false, error: 'Already claimed' };
        if (teamData.hbal >= 3 && teamData.bant >= 4) {
            teamData.dfu3Sghir = true;
            gs.winner = player.team;
            gs.state = 'ended';
            return { success: true, type: 'sghir', team: player.team, gameOver: true };
        }
        return { success: false, error: 'Need 3 Hbal + 4 Bant' };
    }

    return { success: false, error: 'Invalid claim type' };
}

// ═══════════════════════════════════════════
//  ROUND MANAGEMENT
// ═══════════════════════════════════════════

function endRound(gs) {
    // Last capturer takes remaining table cards
    if (gs.lastCapturer !== null && gs.tableCards.length > 0) {
        const lastCap = getPlayerBySeat(gs, gs.lastCapturer);
        if (lastCap) {
            lastCap.capturedCards.push(...gs.tableCards.map(c => ({
                suit: c.suit, value: c.value, code: c.code
            })));
            gs.tableCards = [];
        }
    }

    // Card-count scoring (For every card above 20, +1 Bant)
    let teamACaptured = 0;
    let teamBCaptured = 0;
    for (const p of gs.players) {
        if (p.team === 'A') teamACaptured += p.capturedCards.length;
        else teamBCaptured += p.capturedCards.length;
    }

    if (teamACaptured > 20) {
        gs.teamA.bant += (teamACaptured - 20);
    } else if (teamBCaptured > 20) {
        gs.teamB.bant += (teamBCaptured - 20);
    }

    // Check if anyone won at the end of the round scoring
    const totalHbalA = gs.teamA.hbal + Math.floor(gs.teamA.bant / 6);
    const totalHbalB = gs.teamB.hbal + Math.floor(gs.teamB.bant / 6);

    if (totalHbalA >= 8 || totalHbalB >= 8) {
        gs.winner = totalHbalA >= 8 ? 'A' : 'B';
        gs.state = 'ended';
        return;
    }

    // Automatically continue game with a fresh deck!
    startNewRound(gs);
}

function dealNewHands(gs) {
    for (const player of gs.players) {
        const n = Math.min(CARDS_PER_DEAL, gs.deck.length);
        if (n > 0) player.hand = deal(gs.deck, n);
    }
    gs.phase = 'announcing';
    gs.announcements = {};
    gs.announceDone = {};
}

function startNewRound(gs) {
    const deck = shuffle(createDeck());
    for (const player of gs.players) {
        player.hand = deal(deck, CARDS_PER_DEAL);
        player.capturedCards = [];
        player._fourthAwarded = new Set();
    }
    const tableCards = dealValidTableCards(deck);

    gs.deck = deck;
    gs.tableCards = tableCards;
    gs.currentPlayerIndex = (gs.roundNumber) % 4;
    gs.lastCapturer = null;
    gs.lastPlayedCard = null;
    gs.lastPlayedBySeat = null;
    gs.lastAction = null;
    gs.cardCount = null;
    gs.dealNumber = 1;
    gs.phase = 'announcing';
    gs.announcements = {};
    gs.announceDone = {};
    gs.roundNumber++;
    gs.state = 'active';
}

// ═══════════════════════════════════════════
//  PLAYER VIEW (filtered for client)
// ═══════════════════════════════════════════

function getPlayerView(gs, seatNumber) {
    const me = getPlayerBySeat(gs, seatNumber);
    return {
        myHand: me ? me.hand : [],
        mySeat: seatNumber,
        myTeam: me ? me.team : null,
        myCapturedCount: me ? me.capturedCards.length : 0,
        tableCards: gs.tableCards.map(c => ({
            suit: c.suit, value: c.value, code: c.code,
            playedBySeat: c.playedBySeat, playedByTeam: c.playedByTeam
        })),
        currentPlayerSeat: gs.players[gs.currentPlayerIndex]?.seat || 1,
        roundNumber: gs.roundNumber,
        dealNumber: gs.dealNumber || 1,
        phase: gs.phase,
        announcements: gs.announcements,
        announceDone: gs.announceDone || {},
        state: gs.state,
        turnExpiresAt: gs.turnExpiresAt || null,
        deckRemaining: gs.deck.length,
        teamA: { ...gs.teamA },
        teamB: { ...gs.teamB },
        winner: gs.winner,
        lastAction: gs.lastAction,
        lastCapture: gs.lastCapture || null,
        chainPending: gs.chainPending ? {
            active: gs.chainPending.active,
            value: gs.chainPending.value,
            count: gs.chainPending.count,
            cards: gs.chainPending.cards
        } : null,
        chainWindowExpiresAt: gs.chainWindowExpiresAt || null,
        cardCount: gs.cardCount,
        opponents: gs.players
            .filter(p => p.seat !== seatNumber)
            .map(p => ({
                seat: p.seat, username: p.username, team: p.team,
                handCount: p.hand.length, capturedCount: p.capturedCards.length
            }))
    };
}

module.exports = { initMatch, playCard, claimDfu3, startNewRound, getPlayerView, announce, skipAnnounce, forceSkipAnnouncing, resolveChain };
