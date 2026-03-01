/**
 * Deck utilities for the Moroccan 40-card baraja.
 * Suits: coins (dhab/flouss), cups (copas/jeben), swords (chbada/syouf), clubs (khal/zrawet)
 * Values: 1-7, 10 (Sota), 11 (Caballo), 12 (Rey)
 *
 * In authentic Ronda, capture is by RANK MATCHING (not capture values).
 * The sequence order is: 1,2,3,4,5,6,7,10,11,12 (10 is adjacent to 7).
 */

const SUITS = ['coins', 'cups', 'swords', 'clubs'];
const VALUES = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];

function createDeck() {
    const deck = [];
    for (const suit of SUITS) {
        for (const value of VALUES) {
            deck.push({
                suit,
                value,
                code: `${suit}_${value}`
            });
        }
    }
    return deck;
}

function shuffle(deck) {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function deal(deck, numCards) {
    return deck.splice(0, numCards);
}

module.exports = { SUITS, VALUES, createDeck, shuffle, deal };
