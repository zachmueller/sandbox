(function () {
    'use strict';

    const SIZE = 4;
    let grid = [];
    let score = 0;
    let bestScore = parseInt(localStorage.getItem('2048-best') || '0', 10);
    let gameOver = false;
    let won = false;
    let keepPlaying = false;
    let moving = false;

    // DOM elements
    const tileContainer = document.getElementById('tile-container');
    const scoreEl = document.getElementById('score');
    const bestScoreEl = document.getElementById('best-score');
    const overlay = document.getElementById('overlay');
    const overlayMessage = document.getElementById('overlay-message');
    const overlayBtn = document.getElementById('overlay-btn');
    const newGameBtn = document.getElementById('new-game-btn');

    // ─── Initialization ───────────────────────────────────────────────

    function init() {
        grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
        score = 0;
        gameOver = false;
        won = false;
        keepPlaying = false;
        moving = false;
        updateScore();
        hideOverlay();
        addRandomTile();
        addRandomTile();
        renderTiles();
    }

    // ─── Tile object ──────────────────────────────────────────────────

    let tileId = 0;
    function createTile(row, col, value) {
        return { id: tileId++, row, col, value, mergedFrom: null, isNew: true };
    }

    // ─── Random tile ──────────────────────────────────────────────────

    function emptyCells() {
        const cells = [];
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (!grid[r][c]) cells.push({ r, c });
            }
        }
        return cells;
    }

    function addRandomTile() {
        const available = emptyCells();
        if (available.length === 0) return;
        const { r, c } = available[Math.floor(Math.random() * available.length)];
        const value = Math.random() < 0.9 ? 2 : 4;
        grid[r][c] = createTile(r, c, value);
    }

    // ─── Rendering ────────────────────────────────────────────────────

    function renderTiles() {
        tileContainer.innerHTML = '';
        const containerWidth = tileContainer.offsetWidth;
        const gap = 12;
        const tileSize = (containerWidth - gap * (SIZE - 1)) / SIZE;

        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                const tile = grid[r][c];
                if (!tile) continue;

                const el = document.createElement('div');
                const cssClass = tile.value <= 2048 ? `tile-${tile.value}` : 'tile-super';
                el.className = `tile ${cssClass}`;
                if (tile.isNew) el.classList.add('new');
                if (tile.mergedFrom) el.classList.add('merged');

                const left = c * (tileSize + gap);
                const top = r * (tileSize + gap);
                el.style.width = tileSize + 'px';
                el.style.height = tileSize + 'px';
                el.style.left = left + 'px';
                el.style.top = top + 'px';
                el.style.lineHeight = tileSize + 'px';

                // Responsive font size
                if (tile.value < 100) {
                    el.style.fontSize = (tileSize * 0.45) + 'px';
                } else if (tile.value < 1000) {
                    el.style.fontSize = (tileSize * 0.36) + 'px';
                } else if (tile.value < 10000) {
                    el.style.fontSize = (tileSize * 0.28) + 'px';
                } else {
                    el.style.fontSize = (tileSize * 0.22) + 'px';
                }

                el.textContent = tile.value;
                tileContainer.appendChild(el);
            }
        }

        // Clear new/merged flags after rendering
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (grid[r][c]) {
                    grid[r][c].isNew = false;
                    grid[r][c].mergedFrom = null;
                }
            }
        }
    }

    // ─── Score ────────────────────────────────────────────────────────

    function updateScore() {
        scoreEl.textContent = score;
        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem('2048-best', bestScore);
        }
        bestScoreEl.textContent = bestScore;
    }

    // ─── Overlay ──────────────────────────────────────────────────────

    function showOverlay(message, btnText) {
        overlayMessage.textContent = message;
        overlayBtn.textContent = btnText;
        overlay.classList.add('active');
    }

    function hideOverlay() {
        overlay.classList.remove('active');
    }

    // ─── Movement logic ───────────────────────────────────────────────

    // Returns traversal order for rows and columns based on direction
    function buildTraversals(direction) {
        const rows = [];
        const cols = [];
        for (let i = 0; i < SIZE; i++) {
            rows.push(i);
            cols.push(i);
        }
        // We need to process tiles from the edge they're moving toward
        if (direction === 'down') rows.reverse();
        if (direction === 'right') cols.reverse();
        return { rows, cols };
    }

    function getVector(direction) {
        const map = {
            up:    { dr: -1, dc:  0 },
            down:  { dr:  1, dc:  0 },
            left:  { dr:  0, dc: -1 },
            right: { dr:  0, dc:  1 },
        };
        return map[direction];
    }

    function inBounds(r, c) {
        return r >= 0 && r < SIZE && c >= 0 && c < SIZE;
    }

    // Find the farthest position a tile can move and the next cell (potential merge target)
    function findFarthest(row, col, vector) {
        let prevR = row;
        let prevC = col;
        let r = row + vector.dr;
        let c = col + vector.dc;

        while (inBounds(r, c) && !grid[r][c]) {
            prevR = r;
            prevC = c;
            r += vector.dr;
            c += vector.dc;
        }

        return {
            farthest: { r: prevR, c: prevC },
            next: inBounds(r, c) ? { r, c } : null,
        };
    }

    function move(direction) {
        if (gameOver && !won) return false;
        if (won && !keepPlaying) return false;

        const vector = getVector(direction);
        const { rows, cols } = buildTraversals(direction);
        let moved = false;

        // Track which tiles have already been merged this turn
        const mergedSet = new Set();

        for (const r of rows) {
            for (const c of cols) {
                const tile = grid[r][c];
                if (!tile) continue;

                const { farthest, next } = findFarthest(r, c, vector);

                // Check if we can merge with the next tile
                if (next && grid[next.r][next.c] &&
                    grid[next.r][next.c].value === tile.value &&
                    !mergedSet.has(`${next.r},${next.c}`)) {
                    // Merge
                    const mergedValue = tile.value * 2;
                    const merged = createTile(next.r, next.c, mergedValue);
                    merged.mergedFrom = [tile, grid[next.r][next.c]];
                    merged.isNew = false;

                    grid[r][c] = null;
                    grid[next.r][next.c] = merged;
                    mergedSet.add(`${next.r},${next.c}`);

                    score += mergedValue;
                    moved = true;

                    // Check win
                    if (mergedValue === 2048 && !keepPlaying) {
                        won = true;
                    }
                } else {
                    // Move to farthest empty cell
                    if (farthest.r !== r || farthest.c !== c) {
                        grid[r][c] = null;
                        tile.row = farthest.r;
                        tile.col = farthest.c;
                        grid[farthest.r][farthest.c] = tile;
                        moved = true;
                    }
                }
            }
        }

        return moved;
    }

    function movesAvailable() {
        // Any empty cell means a move is available
        if (emptyCells().length > 0) return true;

        // Check for possible merges
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                const val = grid[r][c].value;
                // Check right
                if (c < SIZE - 1 && grid[r][c + 1].value === val) return true;
                // Check down
                if (r < SIZE - 1 && grid[r + 1][c].value === val) return true;
            }
        }
        return false;
    }

    function handleMove(direction) {
        if (moving) return;
        moving = true;

        const moved = move(direction);
        if (moved) {
            addRandomTile();
            updateScore();
            renderTiles();

            // Check game state after animation
            setTimeout(() => {
                if (won && !keepPlaying) {
                    showOverlay('You Win!', 'Keep Playing');
                } else if (!movesAvailable()) {
                    gameOver = true;
                    showOverlay('Game Over!', 'Try Again');
                }
                moving = false;
            }, 150);
        } else {
            moving = false;
        }
    }

    // ─── Input handling ───────────────────────────────────────────────

    // Keyboard
    document.addEventListener('keydown', function (e) {
        const keyMap = {
            ArrowUp: 'up',
            ArrowDown: 'down',
            ArrowLeft: 'left',
            ArrowRight: 'right',
        };
        const direction = keyMap[e.key];
        if (direction) {
            e.preventDefault();
            handleMove(direction);
        }
    });

    // Touch / swipe
    let touchStartX = 0;
    let touchStartY = 0;

    document.addEventListener('touchstart', function (e) {
        if (e.touches.length === 1) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }
    }, { passive: true });

    document.addEventListener('touchend', function (e) {
        if (e.changedTouches.length === 1) {
            const dx = e.changedTouches[0].clientX - touchStartX;
            const dy = e.changedTouches[0].clientY - touchStartY;
            const absDx = Math.abs(dx);
            const absDy = Math.abs(dy);
            const minSwipe = 30;

            if (Math.max(absDx, absDy) < minSwipe) return;

            if (absDx > absDy) {
                handleMove(dx > 0 ? 'right' : 'left');
            } else {
                handleMove(dy > 0 ? 'down' : 'up');
            }
        }
    }, { passive: true });

    // ─── Buttons ──────────────────────────────────────────────────────

    newGameBtn.addEventListener('click', init);

    overlayBtn.addEventListener('click', function () {
        if (won && !keepPlaying) {
            keepPlaying = true;
            hideOverlay();
        } else {
            init();
        }
    });

    // ─── Handle window resize ─────────────────────────────────────────
    window.addEventListener('resize', renderTiles);

    // ─── Start game ───────────────────────────────────────────────────
    bestScoreEl.textContent = bestScore;
    init();
})();