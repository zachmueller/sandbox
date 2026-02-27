/**
 * Computer Player AI for Rummikub
 * 
 * Strategy:
 * 1. Find all possible groups (same number, different colors) from hand
 * 2. Find all possible runs (consecutive same-color tiles) from hand
 * 3. Try to add tiles to existing melds on the table
 * 4. If initial meld not yet played, ensure first play totals >= 30
 * 5. If no plays possible, draw a tile
 */

import { isValidMeld } from './melds.js';

/**
 * Compute a computer player's turn.
 * 
 * @param {Array} hand - The computer player's tiles
 * @param {Array} table - Current table melds (array of arrays of tiles)
 * @param {boolean} hasPlayedInitialMeld - Whether this player has played their initial meld
 * @returns {{ action: 'play'|'draw', newTable?: Array, newRack?: Array }}
 */
export function computeComputerTurn(hand, table, hasPlayedInitialMeld) {
    // Deep copy to avoid mutating originals during analysis
    const handCopy = JSON.parse(JSON.stringify(hand));
    const tableCopy = JSON.parse(JSON.stringify(table));

    if (!hasPlayedInitialMeld) {
        return tryInitialMeld(handCopy, tableCopy);
    }

    return tryRegularTurn(handCopy, tableCopy);
}

/**
 * Try to make an initial meld (>= 30 points from own tiles only)
 */
function tryInitialMeld(hand, table) {
    // Find all possible melds from hand
    const possibleMelds = findAllMeldsFromHand(hand);

    // Try combinations that total >= 30
    const bestCombo = findMeldComboWithMinPoints(possibleMelds, 30);

    if (bestCombo && bestCombo.length > 0) {
        const usedTileIds = new Set();
        const newMelds = [];

        for (const meld of bestCombo) {
            newMelds.push(meld);
            for (const tile of meld) {
                usedTileIds.add(tile.id);
            }
        }

        const newRack = hand.filter(t => !usedTileIds.has(t.id));
        const newTable = [...table, ...newMelds];

        return { action: 'play', newTable, newRack };
    }

    return { action: 'draw' };
}

/**
 * Try a regular turn (can interact with table melds)
 */
function tryRegularTurn(hand, table) {
    let currentHand = [...hand];
    let currentTable = JSON.parse(JSON.stringify(table));
    let played = false;

    // Strategy 1: Try to add tiles to existing melds on the table
    const addResult = tryAddToExistingMelds(currentHand, currentTable);
    if (addResult.played) {
        currentHand = addResult.hand;
        currentTable = addResult.table;
        played = true;
    }

    // Strategy 2: Try to form new melds from hand
    const newMelds = findAllMeldsFromHand(currentHand);
    if (newMelds.length > 0) {
        // Greedily play melds (prefer larger melds first)
        const sorted = [...newMelds].sort((a, b) => b.length - a.length);
        const usedIds = new Set();

        for (const meld of sorted) {
            // Check no tile in this meld is already used
            if (meld.some(t => usedIds.has(t.id))) continue;

            currentTable.push(meld);
            for (const t of meld) {
                usedIds.add(t.id);
            }
            played = true;
        }

        if (played) {
            currentHand = currentHand.filter(t => !usedIds.has(t.id));
        }
    }

    if (played) {
        return { action: 'play', newTable: currentTable, newRack: currentHand };
    }

    return { action: 'draw' };
}

/**
 * Try to add tiles from hand to existing melds on the table
 */
function tryAddToExistingMelds(hand, table) {
    let modified = false;
    const remainingHand = [...hand];

    for (let meldIdx = 0; meldIdx < table.length; meldIdx++) {
        const meld = table[meldIdx];

        for (let i = remainingHand.length - 1; i >= 0; i--) {
            const tile = remainingHand[i];

            // Try adding to beginning
            const withPrepend = [tile, ...meld];
            if (isValidMeld(withPrepend)) {
                table[meldIdx] = withPrepend;
                remainingHand.splice(i, 1);
                modified = true;
                continue;
            }

            // Try adding to end
            const withAppend = [...meld, tile];
            if (isValidMeld(withAppend)) {
                table[meldIdx] = withAppend;
                remainingHand.splice(i, 1);
                modified = true;
                continue;
            }
        }
    }

    return { played: modified, hand: remainingHand, table };
}

/**
 * Find all possible valid melds from a hand of tiles
 */
function findAllMeldsFromHand(hand) {
    const melds = [];

    // Find groups (same number, different colors)
    const byNumber = {};
    for (const tile of hand) {
        if (tile.isJoker) continue;
        if (!byNumber[tile.number]) byNumber[tile.number] = [];
        byNumber[tile.number].push(tile);
    }

    const jokers = hand.filter(t => t.isJoker);

    for (const num of Object.keys(byNumber)) {
        const tiles = byNumber[num];
        // Deduplicate by color (keep one per color)
        const byColor = {};
        for (const t of tiles) {
            if (!byColor[t.color]) byColor[t.color] = t;
        }
        const uniqueColorTiles = Object.values(byColor);

        if (uniqueColorTiles.length >= 3) {
            // Add groups of 3
            if (uniqueColorTiles.length >= 3) {
                const combos = getCombinations(uniqueColorTiles, 3);
                for (const combo of combos) {
                    melds.push(combo);
                }
            }
            // Add groups of 4
            if (uniqueColorTiles.length >= 4) {
                melds.push([...uniqueColorTiles.slice(0, 4)]);
            }
        }

        // Try groups with jokers (only if we have 2 unique colors + joker)
        if (uniqueColorTiles.length === 2 && jokers.length > 0) {
            melds.push([...uniqueColorTiles, jokers[0]]);
        }
    }

    // Find runs (consecutive numbers, same color)
    const byColor = {};
    for (const tile of hand) {
        if (tile.isJoker) continue;
        if (!byColor[tile.color]) byColor[tile.color] = [];
        byColor[tile.color].push(tile);
    }

    for (const color of Object.keys(byColor)) {
        const tiles = byColor[color];
        // Sort by number, deduplicate
        const sorted = [...tiles].sort((a, b) => a.number - b.number);
        const unique = [];
        const seen = new Set();
        for (const t of sorted) {
            if (!seen.has(t.number)) {
                seen.add(t.number);
                unique.push(t);
            }
        }

        // Find all consecutive sequences of length >= 3
        for (let start = 0; start < unique.length; start++) {
            const run = [unique[start]];
            for (let j = start + 1; j < unique.length; j++) {
                if (unique[j].number === run[run.length - 1].number + 1) {
                    run.push(unique[j]);
                    if (run.length >= 3) {
                        melds.push([...run]);
                    }
                } else {
                    break;
                }
            }
        }
    }

    return melds;
}

/**
 * Find a combination of non-overlapping melds that total >= minPoints
 */
function findMeldComboWithMinPoints(melds, minPoints) {
    if (melds.length === 0) return null;

    // Sort melds by total point value descending
    const scored = melds.map(meld => ({
        meld,
        points: meld.reduce((sum, t) => sum + (t.isJoker ? 30 : t.number), 0),
        tileIds: new Set(meld.map(t => t.id)),
    })).sort((a, b) => b.points - a.points);

    // Greedy approach: pick highest-value non-overlapping melds
    const selected = [];
    const usedIds = new Set();
    let totalPoints = 0;

    for (const entry of scored) {
        // Check no overlap
        let overlaps = false;
        for (const id of entry.tileIds) {
            if (usedIds.has(id)) {
                overlaps = true;
                break;
            }
        }
        if (overlaps) continue;

        selected.push(entry.meld);
        for (const id of entry.tileIds) {
            usedIds.add(id);
        }
        totalPoints += entry.points;

        if (totalPoints >= minPoints) {
            return selected;
        }
    }

    // If greedy didn't reach minPoints, try brute-force for small sets
    if (melds.length <= 12) {
        const result = bruteForceCombo(scored, 0, [], new Set(), 0, minPoints);
        if (result) return result;
    }

    return null;
}

/**
 * Brute-force search for non-overlapping meld combination meeting point threshold
 */
function bruteForceCombo(scored, index, selected, usedIds, currentPoints, minPoints) {
    if (currentPoints >= minPoints) {
        return selected.map(s => s.meld);
    }
    if (index >= scored.length) return null;

    for (let i = index; i < scored.length; i++) {
        const entry = scored[i];
        let overlaps = false;
        for (const id of entry.tileIds) {
            if (usedIds.has(id)) {
                overlaps = true;
                break;
            }
        }
        if (overlaps) continue;

        // Include this meld
        const newUsed = new Set(usedIds);
        for (const id of entry.tileIds) {
            newUsed.add(id);
        }
        const result = bruteForceCombo(
            scored, i + 1,
            [...selected, entry],
            newUsed,
            currentPoints + entry.points,
            minPoints
        );
        if (result) return result;
    }

    return null;
}

/**
 * Get all combinations of size k from array
 */
function getCombinations(arr, k) {
    const results = [];

    function combine(start, current) {
        if (current.length === k) {
            results.push([...current]);
            return;
        }
        for (let i = start; i < arr.length; i++) {
            current.push(arr[i]);
            combine(i + 1, current);
            current.pop();
        }
    }

    combine(0, []);
    return results;
}