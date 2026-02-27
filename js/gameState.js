/**
 * Game State Management for Rummikub
 * 
 * Manages the authoritative game state (host-side) and local state.
 * The host maintains the pool, deals tiles, and validates turns.
 */

import { createTilePool, seededShuffle, getTotalValue } from './tiles.js';
import { validateTable, meetsInitialMeldRequirement } from './melds.js';

const INITIAL_TILES_PER_PLAYER = 14;

/**
 * Create a new game state (host only)
 */
export function createGameState(players, seed) {
    const pool = createTilePool();
    seededShuffle(pool, seed);

    // Deal tiles to each player
    const hands = {};
    for (const player of players) {
        hands[player.id] = pool.splice(0, INITIAL_TILES_PER_PLAYER);
    }

    return {
        pool,
        hands,
        table: [],                          // Array of melds (each meld is an array of tiles)
        players,                            // Array of { id, name }
        currentPlayerIndex: 0,
        turnNumber: 0,
        hasPlayedInitialMeld: {},           // player.id -> boolean
        gameOver: false,
        winner: null,
    };
}

/**
 * Get current player
 */
export function getCurrentPlayer(state) {
    return state.players[state.currentPlayerIndex];
}

/**
 * Advance to the next player's turn
 */
export function advanceTurn(state) {
    state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
    state.turnNumber++;
    return state;
}

/**
 * Draw a tile from the pool for a player
 * Returns the drawn tile or null if pool is empty
 */
export function drawTile(state, playerId) {
    if (state.pool.length === 0) return null;
    const tile = state.pool.pop();
    state.hands[playerId].push(tile);
    return tile;
}

/**
 * Validate and apply a player's turn
 * 
 * @param {object} state - Current game state
 * @param {string} playerId - The player making the move
 * @param {Array} newTable - The proposed new table state (array of melds)
 * @param {Array} newRack - The player's proposed new rack
 * @returns {{ valid: boolean, error?: string }}
 */
export function applyTurn(state, playerId, newTable, newRack) {
    const playerHand = state.hands[playerId];

    // Validate all melds on the new table
    const tableValidation = validateTable(newTable);
    if (!tableValidation.valid) {
        return { valid: false, error: 'Invalid melds on the table' };
    }

    // Count tiles: all tiles should be accounted for
    const oldTileIds = new Set([
        ...playerHand.map(t => t.id),
        ...state.table.flat().map(t => t.id),
    ]);
    const newTileIds = new Set([
        ...newRack.map(t => t.id),
        ...newTable.flat().map(t => t.id),
    ]);

    // Player must have placed at least one tile from rack (unless undoing/rearranging)
    const tilesFromRack = playerHand.filter(t => !newRack.find(r => r.id === t.id));
    const tilesPlacedOnTable = newTable.flat().filter(t => playerHand.find(h => h.id === t.id));

    if (tilesFromRack.length === 0) {
        return { valid: false, error: 'You must place at least one tile on the table' };
    }

    // Check initial meld requirement (>= 30 points from own tiles)
    if (!state.hasPlayedInitialMeld[playerId]) {
        if (!meetsInitialMeldRequirement(tilesPlacedOnTable)) {
            return { valid: false, error: 'Initial meld must total at least 30 points from your own tiles' };
        }
        state.hasPlayedInitialMeld[playerId] = true;
    }

    // Apply changes
    state.hands[playerId] = newRack;
    state.table = newTable;

    // Check win condition
    if (newRack.length === 0) {
        state.gameOver = true;
        state.winner = playerId;
    }

    return { valid: true };
}

/**
 * Calculate final scores (negative points for tiles remaining in hand)
 */
export function calculateScores(state) {
    const scores = {};
    for (const player of state.players) {
        const hand = state.hands[player.id] || [];
        scores[player.id] = -getTotalValue(hand);
    }
    // Winner gets the sum of all other players' penalties as positive points
    if (state.winner) {
        let bonus = 0;
        for (const player of state.players) {
            if (player.id !== state.winner) {
                bonus += getTotalValue(state.hands[player.id] || []);
            }
        }
        scores[state.winner] = bonus;
    }
    return scores;
}

/**
 * Create a snapshot of the game state to send to a specific player
 * (hides other players' hands and pool contents)
 */
export function createPlayerView(state, playerId) {
    const handCounts = {};
    for (const player of state.players) {
        handCounts[player.id] = (state.hands[player.id] || []).length;
    }

    return {
        table: state.table,
        hand: state.hands[playerId] || [],
        handCounts,
        players: state.players,
        currentPlayerIndex: state.currentPlayerIndex,
        turnNumber: state.turnNumber,
        poolSize: state.pool.length,
        hasPlayedInitialMeld: state.hasPlayedInitialMeld[playerId] || false,
        gameOver: state.gameOver,
        winner: state.winner,
    };
}