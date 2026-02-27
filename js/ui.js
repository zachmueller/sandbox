/**
 * UI Rendering and Interaction for Rummikub
 * 
 * Handles:
 * - Tile rendering (rack and table)
 * - Drag and drop between rack and table
 * - Creating new melds by dropping on empty table area
 * - Adding tiles to existing melds
 * - Rearranging tiles within melds
 */

import { isValidMeld } from './melds.js';

const TILE_COLORS = {
    red: '#e74c3c',
    blue: '#3498db',
    orange: '#e67e22',
    black: '#2c3e50',
    joker: '#9b59b6',
};

/**
 * Create a DOM element for a tile
 */
export function createTileElement(tile, options = {}) {
    const el = document.createElement('div');
    el.className = 'tile';
    el.dataset.tileId = tile.id;

    if (tile.isJoker) {
        el.classList.add('tile-joker');
        el.innerHTML = `<span class="tile-label">★</span>`;
        el.style.color = TILE_COLORS.joker;
    } else {
        el.innerHTML = `<span class="tile-label">${tile.number}</span>`;
        el.style.color = TILE_COLORS[tile.color] || '#333';
        el.classList.add(`tile-${tile.color}`);
    }

    if (options.selected) {
        el.classList.add('selected');
    }

    if (options.draggable !== false) {
        el.draggable = true;
    }

    return el;
}

/**
 * UI Manager - handles all rendering and interaction
 */
export class UIManager {
    constructor() {
        // State
        this.rack = [];
        this.table = [];                    // Array of melds (arrays of tiles)
        this.selectedTiles = new Set();     // Set of tile IDs selected on rack
        this.isMyTurn = false;
        this.hasPlayedInitialMeld = false;
        this.computerPlayerIds = new Set(); // IDs of computer players

        // Snapshot of table state at start of turn (for undo)
        this.turnStartTable = null;
        this.turnStartRack = null;

        // Callbacks
        this.onEndTurn = null;              // (newTable, newRack) => void
        this.onDrawTile = null;             // () => void

        // DOM elements
        this.rackEl = document.getElementById('player-rack');
        this.tableMeldsEl = document.getElementById('table-melds');
        this.turnIndicatorEl = document.getElementById('turn-indicator');
        this.opponentsInfoEl = document.getElementById('opponents-info');
        this.endTurnBtn = document.getElementById('end-turn-btn');
        this.drawBtn = document.getElementById('draw-btn');
        this.undoBtn = document.getElementById('undo-btn');
        this.sortNumberBtn = document.getElementById('sort-number-btn');
        this.sortColorBtn = document.getElementById('sort-color-btn');

        this._setupEventListeners();
        this._setupDragAndDrop();
    }

    /**
     * Setup button event listeners
     */
    _setupEventListeners() {
        this.endTurnBtn.addEventListener('click', () => this._handleEndTurn());
        this.drawBtn.addEventListener('click', () => this._handleDraw());
        this.undoBtn.addEventListener('click', () => this._handleUndo());

        this.sortNumberBtn.addEventListener('click', () => {
            this._sortRack('number');
        });
        this.sortColorBtn.addEventListener('click', () => {
            this._sortRack('color');
        });
    }

    /**
     * Setup drag and drop for tiles
     */
    _setupDragAndDrop() {
        let draggedTileId = null;
        let dragSource = null;          // 'rack' | 'meld'
        let dragSourceMeldIndex = null;
        let dragSourceTileIndex = null;

        // --- Drag start ---
        document.addEventListener('dragstart', (e) => {
            const tileEl = e.target.closest('.tile');
            if (!tileEl || !this.isMyTurn) {
                e.preventDefault();
                return;
            }

            draggedTileId = parseInt(tileEl.dataset.tileId);
            tileEl.classList.add('dragging');

            // Determine source
            if (tileEl.closest('.player-rack')) {
                dragSource = 'rack';
            } else if (tileEl.closest('.meld')) {
                dragSource = 'meld';
                const meldEl = tileEl.closest('.meld');
                dragSourceMeldIndex = parseInt(meldEl.dataset.meldIndex);
                const tileIndex = Array.from(meldEl.children).indexOf(tileEl);
                dragSourceTileIndex = tileIndex;
            }

            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', draggedTileId.toString());
        });

        document.addEventListener('dragend', (e) => {
            document.querySelectorAll('.dragging').forEach(el => el.classList.remove('dragging'));
            document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
            document.querySelectorAll('.drag-over-left').forEach(el => el.classList.remove('drag-over-left'));
            document.querySelectorAll('.drag-over-right').forEach(el => el.classList.remove('drag-over-right'));
            draggedTileId = null;
            dragSource = null;
            dragSourceMeldIndex = null;
            dragSourceTileIndex = null;
        });

        // --- Drop on rack ---
        this.rackEl.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            this.rackEl.classList.add('drag-over');
        });

        this.rackEl.addEventListener('dragleave', () => {
            this.rackEl.classList.remove('drag-over');
        });

        this.rackEl.addEventListener('drop', (e) => {
            e.preventDefault();
            this.rackEl.classList.remove('drag-over');

            if (draggedTileId === null) return;

            if (dragSource === 'meld') {
                // Move tile from table meld back to rack
                this._moveTileFromMeldToRack(dragSourceMeldIndex, draggedTileId);
            } else if (dragSource === 'rack') {
                // Reorder within rack
                this._reorderRackTile(draggedTileId, e);
            }
        });

        // --- Drop on table area (create new meld) ---
        this.tableMeldsEl.addEventListener('dragover', (e) => {
            if (e.target === this.tableMeldsEl || e.target.closest('.table-placeholder')) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                this.tableMeldsEl.classList.add('drag-over');
            }
        });

        this.tableMeldsEl.addEventListener('dragleave', (e) => {
            if (e.target === this.tableMeldsEl || !this.tableMeldsEl.contains(e.relatedTarget)) {
                this.tableMeldsEl.classList.remove('drag-over');
            }
        });

        this.tableMeldsEl.addEventListener('drop', (e) => {
            // Only create new meld if dropped on empty area (not on existing meld)
            if (e.target !== this.tableMeldsEl && !e.target.closest('.table-placeholder')) return;

            e.preventDefault();
            this.tableMeldsEl.classList.remove('drag-over');

            if (draggedTileId === null) return;

            const tile = this._removeTileFromSource(dragSource, dragSourceMeldIndex, draggedTileId);
            if (tile) {
                // Create new meld with this single tile
                this.table.push([tile]);
                this._renderTable();
                this._renderRack();
                this._updateButtons();
            }
        });

        // --- Drop on existing meld (add to meld) ---
        this.tableMeldsEl.addEventListener('dragover', (e) => {
            const meldEl = e.target.closest('.meld');
            if (meldEl) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';

                // Determine left/right insertion point
                const rect = meldEl.getBoundingClientRect();
                const tileEls = Array.from(meldEl.querySelectorAll('.tile'));

                meldEl.classList.add('drag-over');

                // Find closest tile for insertion indicator
                let insertBefore = null;
                for (const tEl of tileEls) {
                    const tRect = tEl.getBoundingClientRect();
                    const midX = tRect.left + tRect.width / 2;
                    if (e.clientX < midX) {
                        insertBefore = tEl;
                        break;
                    }
                }

                // Clear previous indicators
                tileEls.forEach(t => {
                    t.classList.remove('drag-over-left', 'drag-over-right');
                });

                if (insertBefore) {
                    insertBefore.classList.add('drag-over-left');
                } else if (tileEls.length > 0) {
                    tileEls[tileEls.length - 1].classList.add('drag-over-right');
                }
            }
        });

        // We need a delegated drop handler on meld elements
        this.tableMeldsEl.addEventListener('drop', (e) => {
            const meldEl = e.target.closest('.meld');
            if (!meldEl) return;

            e.preventDefault();
            e.stopPropagation();

            if (draggedTileId === null) return;

            const meldIndex = parseInt(meldEl.dataset.meldIndex);

            // Determine insertion position
            const tileEls = Array.from(meldEl.querySelectorAll('.tile'));
            let insertIndex = tileEls.length;

            for (let i = 0; i < tileEls.length; i++) {
                const tRect = tileEls[i].getBoundingClientRect();
                const midX = tRect.left + tRect.width / 2;
                if (e.clientX < midX) {
                    insertIndex = i;
                    break;
                }
            }

            // Handle reorder within same meld
            if (dragSource === 'meld' && dragSourceMeldIndex === meldIndex) {
                const meld = this.table[meldIndex];
                const currentIndex = meld.findIndex(t => t.id === draggedTileId);
                if (currentIndex !== -1 && currentIndex !== insertIndex) {
                    const [tile] = meld.splice(currentIndex, 1);
                    if (insertIndex > currentIndex) insertIndex--;
                    meld.splice(insertIndex, 0, tile);
                    this._renderTable();
                }
                return;
            }

            const tile = this._removeTileFromSource(dragSource, dragSourceMeldIndex, draggedTileId);
            if (tile) {
                this.table[meldIndex].splice(insertIndex, 0, tile);
                this._renderTable();
                this._renderRack();
                this._updateButtons();
            }
        });
    }

    /**
     * Remove a tile from its source (rack or meld) and return it
     */
    _removeTileFromSource(source, meldIndex, tileId) {
        if (source === 'rack') {
            const idx = this.rack.findIndex(t => t.id === tileId);
            if (idx !== -1) {
                return this.rack.splice(idx, 1)[0];
            }
        } else if (source === 'meld') {
            const meld = this.table[meldIndex];
            if (meld) {
                const idx = meld.findIndex(t => t.id === tileId);
                if (idx !== -1) {
                    const tile = meld.splice(idx, 1)[0];
                    // Remove empty melds
                    if (meld.length === 0) {
                        this.table.splice(meldIndex, 1);
                    }
                    return tile;
                }
            }
        }
        return null;
    }

    /**
     * Move a tile from a table meld back to the rack
     */
    _moveTileFromMeldToRack(meldIndex, tileId) {
        const meld = this.table[meldIndex];
        if (!meld) return;

        const idx = meld.findIndex(t => t.id === tileId);
        if (idx === -1) return;

        const tile = meld.splice(idx, 1)[0];
        this.rack.push(tile);

        // Remove empty melds
        if (meld.length === 0) {
            this.table.splice(meldIndex, 1);
        }

        this._renderTable();
        this._renderRack();
        this._updateButtons();
    }

    /**
     * Reorder a tile within the rack
     */
    _reorderRackTile(tileId, event) {
        const fromIdx = this.rack.findIndex(t => t.id === tileId);
        if (fromIdx === -1) return;

        // Find insertion position based on drop location
        const tileEls = Array.from(this.rackEl.querySelectorAll('.tile'));
        let toIdx = tileEls.length;

        for (let i = 0; i < tileEls.length; i++) {
            const rect = tileEls[i].getBoundingClientRect();
            const midX = rect.left + rect.width / 2;
            if (event.clientX < midX) {
                toIdx = i;
                break;
            }
        }

        const [tile] = this.rack.splice(fromIdx, 1);
        if (toIdx > fromIdx) toIdx--;
        this.rack.splice(toIdx, 0, tile);
        this._renderRack();
    }

    /**
     * Sort rack tiles
     */
    _sortRack(mode) {
        const colorOrder = { red: 0, blue: 1, orange: 2, black: 3, joker: 4 };

        if (mode === 'number') {
            this.rack.sort((a, b) => {
                if (a.isJoker !== b.isJoker) return a.isJoker ? 1 : -1;
                if (a.number !== b.number) return a.number - b.number;
                return colorOrder[a.color] - colorOrder[b.color];
            });
        } else {
            this.rack.sort((a, b) => {
                if (a.isJoker !== b.isJoker) return a.isJoker ? 1 : -1;
                if (a.color !== b.color) return colorOrder[a.color] - colorOrder[b.color];
                return a.number - b.number;
            });
        }
        this._renderRack();
    }

    /**
     * Handle end turn button
     */
    _handleEndTurn() {
        if (!this.isMyTurn) return;

        // Validate all melds
        const invalidMelds = [];
        for (let i = 0; i < this.table.length; i++) {
            if (!isValidMeld(this.table[i])) {
                invalidMelds.push(i);
            }
        }

        if (invalidMelds.length > 0) {
            this._showMessage('Some melds are invalid. Fix them before ending your turn.', 'error');
            // Highlight invalid melds
            document.querySelectorAll('.meld').forEach((el, idx) => {
                if (invalidMelds.includes(idx)) {
                    el.classList.add('invalid');
                    setTimeout(() => el.classList.remove('invalid'), 2000);
                }
            });
            return;
        }

        // Check that player placed at least one tile
        const rackIds = new Set(this.rack.map(t => t.id));
        const startRackIds = new Set(this.turnStartRack.map(t => t.id));
        const tilesPlaced = this.turnStartRack.filter(t => !rackIds.has(t.id));

        if (tilesPlaced.length === 0) {
            this._showMessage('You must place at least one tile. Use "Draw" if you can\'t play.', 'error');
            return;
        }

        if (this.onEndTurn) {
            this.onEndTurn(this.table, this.rack);
        }
    }

    /**
     * Handle draw tile button
     */
    _handleDraw() {
        if (!this.isMyTurn) return;

        // Undo any changes first
        this._handleUndo();

        if (this.onDrawTile) {
            this.onDrawTile();
        }
    }

    /**
     * Handle undo button — restore table and rack to turn start state
     */
    _handleUndo() {
        if (this.turnStartTable && this.turnStartRack) {
            this.table = JSON.parse(JSON.stringify(this.turnStartTable));
            this.rack = JSON.parse(JSON.stringify(this.turnStartRack));
            this._renderTable();
            this._renderRack();
            this._updateButtons();
        }
    }

    /**
     * Show a temporary message in the turn indicator
     */
    _showMessage(text, type = 'info') {
        const el = this.turnIndicatorEl;
        const oldText = el.textContent;
        const oldClass = el.className;

        el.textContent = text;
        el.className = `turn-indicator message-${type}`;

        setTimeout(() => {
            el.textContent = oldText;
            el.className = oldClass;
        }, 3000);
    }

    /**
     * Update button states
     */
    _updateButtons() {
        this.endTurnBtn.disabled = !this.isMyTurn;
        this.drawBtn.disabled = !this.isMyTurn;

        // Enable undo if table/rack differ from turn start
        const changed = this.turnStartRack &&
            JSON.stringify(this.rack.map(t => t.id)) !== JSON.stringify(this.turnStartRack.map(t => t.id));
        this.undoBtn.disabled = !this.isMyTurn || !changed;
    }

    /**
     * Update the game display with a new player view
     */
    updateGameView(view) {
        this.rack = view.hand;
        this.table = view.table;
        this.hasPlayedInitialMeld = view.hasPlayedInitialMeld;

        const currentPlayer = view.players[view.currentPlayerIndex];
        this.isMyTurn = currentPlayer.id === view.myPlayerId;

        // Store turn start state
        if (this.isMyTurn) {
            this.turnStartTable = JSON.parse(JSON.stringify(view.table));
            this.turnStartRack = JSON.parse(JSON.stringify(view.hand));
        }

        // Update turn indicator
        if (view.gameOver) {
            this.turnIndicatorEl.textContent = 'Game Over!';
            this.turnIndicatorEl.className = 'turn-indicator';
        } else if (this.isMyTurn) {
            this.turnIndicatorEl.textContent = 'Your Turn!';
            this.turnIndicatorEl.className = 'turn-indicator my-turn';
        } else if (this.computerPlayerIds.has(currentPlayer.id)) {
            this.turnIndicatorEl.textContent = `🤖 ${currentPlayer.name} is thinking...`;
            this.turnIndicatorEl.className = 'turn-indicator computer-thinking';
        } else {
            this.turnIndicatorEl.textContent = `${currentPlayer.name}'s turn`;
            this.turnIndicatorEl.className = 'turn-indicator';
        }

        // Update opponent info
        this._renderOpponents(view);

        // Render table and rack
        this._renderTable();
        this._renderRack();
        this._updateButtons();

        // Pool info
        const poolInfo = document.getElementById('pool-info');
        if (poolInfo) poolInfo.textContent = `Pool: ${view.poolSize} tiles`;
    }

    /**
     * Render opponent info cards
     */
    _renderOpponents(view) {
        this.opponentsInfoEl.innerHTML = '';

        for (const player of view.players) {
            const card = document.createElement('div');
            card.className = 'opponent-card';

            const isCurrent = view.players[view.currentPlayerIndex].id === player.id;
            const isMe = player.id === view.myPlayerId;
            const isCpu = this.computerPlayerIds.has(player.id);

            if (isCurrent) card.classList.add('current-turn');
            if (isMe) card.classList.add('is-me');

            const tileCount = player.id === view.myPlayerId
                ? view.hand.length
                : view.handCounts[player.id];

            const namePrefix = isMe ? '⭐ ' : (isCpu ? '🤖 ' : '');

            card.innerHTML = `
                <div class="opponent-name">${namePrefix}${player.name}</div>
                <div class="opponent-tiles">${tileCount} tiles</div>
            `;

            this.opponentsInfoEl.appendChild(card);
        }

        // Pool size
        const poolCard = document.createElement('div');
        poolCard.className = 'opponent-card pool-card';
        poolCard.innerHTML = `
            <div class="opponent-name">🎲 Pool</div>
            <div class="opponent-tiles">${view.poolSize} left</div>
        `;
        this.opponentsInfoEl.appendChild(poolCard);
    }

    /**
     * Render the table melds
     */
    _renderTable() {
        this.tableMeldsEl.innerHTML = '';

        if (this.table.length === 0) {
            const placeholder = document.createElement('div');
            placeholder.className = 'table-placeholder';
            placeholder.textContent = 'Table is empty — drag tiles here to create melds!';
            this.tableMeldsEl.appendChild(placeholder);
            return;
        }

        this.table.forEach((meld, meldIndex) => {
            const meldEl = document.createElement('div');
            meldEl.className = 'meld';
            meldEl.dataset.meldIndex = meldIndex;

            const valid = isValidMeld(meld);
            if (!valid) meldEl.classList.add('invalid');

            for (const tile of meld) {
                const tileEl = createTileElement(tile, { draggable: this.isMyTurn });
                meldEl.appendChild(tileEl);
            }

            this.tableMeldsEl.appendChild(meldEl);
        });
    }

    /**
     * Render the player's rack
     */
    _renderRack() {
        this.rackEl.innerHTML = '';

        for (const tile of this.rack) {
            const tileEl = createTileElement(tile, {
                draggable: this.isMyTurn,
                selected: this.selectedTiles.has(tile.id),
            });

            // Click to select/deselect
            tileEl.addEventListener('click', () => {
                if (this.selectedTiles.has(tile.id)) {
                    this.selectedTiles.delete(tile.id);
                    tileEl.classList.remove('selected');
                } else {
                    this.selectedTiles.add(tile.id);
                    tileEl.classList.add('selected');
                }
            });

            this.rackEl.appendChild(tileEl);
        }
    }

    /**
     * Show the game screen
     */
    showGameScreen() {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('game-screen').classList.add('active');
    }

    /**
     * Show game over overlay
     */
    showGameOver(title, message, scores, players) {
        const overlay = document.getElementById('game-over-overlay');
        document.getElementById('game-over-title').textContent = title;
        document.getElementById('game-over-message').textContent = message;

        const scoresEl = document.getElementById('game-over-scores');
        scoresEl.innerHTML = '';

        for (const player of players) {
            const score = scores[player.id] || 0;
            const row = document.createElement('div');
            row.className = 'score-row';
            row.innerHTML = `<span>${player.name}</span><span>${score > 0 ? '+' : ''}${score}</span>`;
            scoresEl.appendChild(row);
        }

        overlay.style.display = 'flex';
    }
}