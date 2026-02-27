/**
 * Tile system for Rummikub
 * 
 * Standard Rummikub has 106 tiles:
 * - 2 sets of tiles numbered 1-13 in each of 4 colors (104 tiles)
 * - 2 joker tiles
 */

export const COLORS = ['red', 'blue', 'orange', 'black'];
export const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

let nextTileId = 0;

/**
 * Create a single tile object
 */
export function createTile(color, number, isJoker = false) {
    return {
        id: nextTileId++,
        color,
        number,
        isJoker,
    };
}

/**
 * Create the full 106-tile pool
 */
export function createTilePool() {
    nextTileId = 0;
    const tiles = [];

    // Two copies of each color/number combo
    for (let copy = 0; copy < 2; copy++) {
        for (const color of COLORS) {
            for (const number of NUMBERS) {
                tiles.push(createTile(color, number, false));
            }
        }
    }

    // Two jokers
    tiles.push(createTile('joker', 0, true));
    tiles.push(createTile('joker', 0, true));

    return tiles;
}

/**
 * Shuffle an array in-place using Fisher-Yates
 */
export function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * Seeded random shuffle (for deterministic game setup)
 */
export function seededShuffle(array, seed) {
    let s = seed;
    function random() {
        s = (s * 1664525 + 1013904223) & 0xFFFFFFFF;
        return (s >>> 0) / 0xFFFFFFFF;
    }
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * Get the point value of a tile (for scoring at game end)
 * Jokers are worth 30 points, numbered tiles are face value
 */
export function getTileValue(tile) {
    if (tile.isJoker) return 30;
    return tile.number;
}

/**
 * Get total value of a set of tiles
 */
export function getTotalValue(tiles) {
    return tiles.reduce((sum, t) => sum + getTileValue(t), 0);
}

/**
 * Serialize a tile for network transmission
 */
export function serializeTile(tile) {
    return { id: tile.id, color: tile.color, number: tile.number, isJoker: tile.isJoker };
}

/**
 * Sort tiles: by number first, then color
 */
export function sortByNumber(tiles) {
    const colorOrder = { red: 0, blue: 1, orange: 2, black: 3, joker: 4 };
    return [...tiles].sort((a, b) => {
        if (a.isJoker !== b.isJoker) return a.isJoker ? 1 : -1;
        if (a.number !== b.number) return a.number - b.number;
        return colorOrder[a.color] - colorOrder[b.color];
    });
}

/**
 * Sort tiles: by color first, then number
 */
export function sortByColor(tiles) {
    const colorOrder = { red: 0, blue: 1, orange: 2, black: 3, joker: 4 };
    return [...tiles].sort((a, b) => {
        if (a.isJoker !== b.isJoker) return a.isJoker ? 1 : -1;
        if (a.color !== b.color) return colorOrder[a.color] - colorOrder[b.color];
        return a.number - b.number;
    });
}