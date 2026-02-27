/**
 * Meld validation for Rummikub
 * 
 * Valid melds:
 * - Group: 3 or 4 tiles of the same number, all different colors
 * - Run: 3+ consecutive tiles of the same color
 * 
 * Jokers can substitute for any tile in a meld.
 */

import { COLORS } from './tiles.js';

/**
 * Check if a set of tiles forms a valid meld (group or run)
 */
export function isValidMeld(tiles) {
    if (!tiles || tiles.length < 3) return false;
    return isValidGroup(tiles) || isValidRun(tiles);
}

/**
 * Check if tiles form a valid group (same number, different colors)
 * Groups can have 3 or 4 tiles.
 */
export function isValidGroup(tiles) {
    if (tiles.length < 3 || tiles.length > 4) return false;

    const nonJokers = tiles.filter(t => !t.isJoker);
    const jokerCount = tiles.length - nonJokers.length;

    if (nonJokers.length === 0) return tiles.length >= 3 && tiles.length <= 4;

    // All non-joker tiles must have the same number
    const number = nonJokers[0].number;
    if (!nonJokers.every(t => t.number === number)) return false;

    // All non-joker tiles must have different colors
    const colors = new Set(nonJokers.map(t => t.color));
    if (colors.size !== nonJokers.length) return false;

    // Total can't exceed 4 (one per color)
    return true;
}

/**
 * Check if tiles form a valid run (consecutive numbers, same color)
 * Runs must have at least 3 tiles.
 */
export function isValidRun(tiles) {
    if (tiles.length < 3) return false;

    const nonJokers = tiles.filter(t => !t.isJoker);
    const jokerCount = tiles.length - nonJokers.length;

    if (nonJokers.length === 0) return tiles.length >= 3;

    // All non-joker tiles must be the same color
    const color = nonJokers[0].color;
    if (!nonJokers.every(t => t.color === color)) return false;

    // Sort non-joker tiles by number
    const sorted = [...nonJokers].sort((a, b) => a.number - b.number);

    // Check for duplicate numbers
    for (let i = 1; i < sorted.length; i++) {
        if (sorted[i].number === sorted[i - 1].number) return false;
    }

    // Check that the span can be filled with available jokers
    const minNum = sorted[0].number;
    const maxNum = sorted[sorted.length - 1].number;
    const span = maxNum - minNum + 1;

    // The tiles array length should equal the span (filled with jokers for gaps)
    if (tiles.length < span) return false;
    if (tiles.length > span) {
        // Extra tiles beyond the span — jokers can extend the run
        // Check if jokers can extend at the beginning or end
        const extendLow = Math.max(0, minNum - 1);
        const extendHigh = Math.min(13, maxNum + (tiles.length - span));
        // Actually let's simplify: just check if run can be formed
        return canFormRun(tiles);
    }

    // Check gaps can be filled by jokers
    let jokersNeeded = 0;
    for (let i = 1; i < sorted.length; i++) {
        jokersNeeded += sorted[i].number - sorted[i - 1].number - 1;
    }

    return jokersNeeded <= jokerCount;
}

/**
 * More thorough run check that handles joker placement at edges
 */
function canFormRun(tiles) {
    const nonJokers = tiles.filter(t => !t.isJoker);
    let jokerCount = tiles.length - nonJokers.length;

    if (nonJokers.length === 0) return tiles.length >= 3;

    const color = nonJokers[0].color;
    if (!nonJokers.every(t => t.color === color)) return false;

    const sorted = [...nonJokers].sort((a, b) => a.number - b.number);

    // Check duplicates
    for (let i = 1; i < sorted.length; i++) {
        if (sorted[i].number === sorted[i - 1].number) return false;
    }

    // Try all possible starting positions for the run
    const runLength = tiles.length;

    for (let start = 1; start <= 13 - runLength + 1; start++) {
        const end = start + runLength - 1;
        if (end > 13) continue;

        let jokersUsed = 0;
        let valid = true;

        // Check all positions in this run are covered
        const numbers = new Set(sorted.map(t => t.number));

        for (let n = start; n <= end; n++) {
            if (!numbers.has(n)) {
                jokersUsed++;
            }
        }

        // All non-joker tiles must fall within [start, end]
        const allInRange = sorted.every(t => t.number >= start && t.number <= end);

        if (allInRange && jokersUsed <= jokerCount && jokersUsed + nonJokers.length === runLength) {
            return true;
        }
    }

    return false;
}

/**
 * Validate all melds on the table
 * Returns { valid: boolean, invalidMeldIndices: number[] }
 */
export function validateTable(melds) {
    const invalidIndices = [];
    for (let i = 0; i < melds.length; i++) {
        if (!isValidMeld(melds[i])) {
            invalidIndices.push(i);
        }
    }
    return {
        valid: invalidIndices.length === 0,
        invalidMeldIndices: invalidIndices,
    };
}

/**
 * Check the initial meld requirement: first melds must total >= 30 points
 * (Only counts tiles from the player's rack, not tiles already on the table)
 */
export function meetsInitialMeldRequirement(newTilesOnTable) {
    let total = 0;
    for (const tile of newTilesOnTable) {
        total += tile.isJoker ? 30 : tile.number;
    }
    return total >= 30;
}