/**
 * Main Application Entry Point for Rummikub P2P
 * 
 * Orchestrates the lobby, networking, game state, and UI.
 * Supports both local (vs computer) and online (P2P) play modes.
 */

import { NetworkManager } from './network.js';
import { UIManager } from './ui.js';
import { createGameState, getCurrentPlayer, advanceTurn, drawTile, applyTurn, calculateScores, createPlayerView } from './gameState.js';
import { computeComputerTurn } from './computerAI.js';

const COMPUTER_NAMES = ['Bot Alice', 'Bot Bob', 'Bot Carol', 'Bot Dave', 'Bot Eve', 'Bot Frank'];
const COMPUTER_TURN_DELAY = 1200; // ms delay before computer takes turn
const MIN_PLAYERS = 2;
const MAX_PLAYERS = 4;  // Rummikub supports 2-4 players

class RummikubApp {
    constructor() {
        this.network = new NetworkManager();
        this.ui = null;                     // Initialized when game screen loads
        this.gameState = null;              // Only set on host / local game
        this.isHost = false;
        this.isLocalGame = false;           // True when playing vs computer
        this.myPlayerId = null;
        this.myName = '';
        this.players = [];                  // Lobby player list { id, name }
        this.gameCode = '';
        this.computerPlayerIds = new Set(); // IDs of computer players
        this.playerCount = 2;              // Default player count for local games
        this._computerTurnTimeout = null;

        this._setupLobby();
        this._setupNetworkHandlers();
    }

    // ========================
    // LOBBY
    // ========================

    _setupLobby() {
        const createBtn = document.getElementById('create-game-btn');
        const joinBtn = document.getElementById('join-game-btn');
        const startBtn = document.getElementById('start-game-btn');
        const copyBtn = document.getElementById('copy-code-btn');
        const newGameBtn = document.getElementById('new-game-btn');
        const localGameBtn = document.getElementById('local-game-btn');
        const playerCountDec = document.getElementById('player-count-dec');
        const playerCountInc = document.getElementById('player-count-inc');

        createBtn.addEventListener('click', () => this._createGame());
        joinBtn.addEventListener('click', () => this._joinGame());
        startBtn.addEventListener('click', () => this._startGame());
        copyBtn.addEventListener('click', () => this._copyGameCode());
        newGameBtn.addEventListener('click', () => this._backToLobby());
        localGameBtn.addEventListener('click', () => this._startLocalGame());

        playerCountDec.addEventListener('click', () => this._adjustPlayerCount(-1));
        playerCountInc.addEventListener('click', () => this._adjustPlayerCount(1));
    }

    _adjustPlayerCount(delta) {
        this.playerCount = Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, this.playerCount + delta));
        document.getElementById('player-count-display').textContent = this.playerCount;

        // Update button disabled states
        document.getElementById('player-count-dec').disabled = this.playerCount <= MIN_PLAYERS;
        document.getElementById('player-count-inc').disabled = this.playerCount >= MAX_PLAYERS;
    }

    // ========================
    // LOCAL GAME (vs Computer)
    // ========================

    _startLocalGame() {
        const nameInput = document.getElementById('local-name');
        const name = nameInput.value.trim();
        if (!name) {
            this._setLobbyStatus('Please enter your name', 'error');
            nameInput.focus();
            return;
        }

        this.isLocalGame = true;
        this.isHost = true;
        this.myName = name;
        this.myPlayerId = 'local-player';
        this.computerPlayerIds = new Set();

        // Build player list
        this.players = [{ id: 'local-player', name }];

        // Add computer players
        for (let i = 0; i < this.playerCount - 1; i++) {
            const cpuId = `cpu-${i}`;
            this.players.push({ id: cpuId, name: COMPUTER_NAMES[i] || `Computer ${i + 1}` });
            this.computerPlayerIds.add(cpuId);
        }

        // Create game state and start
        const seed = Date.now();
        this.gameState = createGameState(this.players, seed);

        this._initGameUI();
        this._sendLocalPlayerView();

        // If computer goes first, trigger their turn
        this._scheduleComputerTurnIfNeeded();
    }

    _sendLocalPlayerView() {
        const view = createPlayerView(this.gameState, this.myPlayerId);
        view.myPlayerId = this.myPlayerId;
        if (this.ui) {
            this.ui.updateGameView(view);
        }
    }

    _scheduleComputerTurnIfNeeded() {
        if (this.gameState.gameOver) return;

        const currentPlayer = getCurrentPlayer(this.gameState);
        if (this.computerPlayerIds.has(currentPlayer.id)) {
            // Show thinking indicator
            this._sendLocalPlayerView();

            this._computerTurnTimeout = setTimeout(() => {
                this._executeComputerTurn(currentPlayer.id);
            }, COMPUTER_TURN_DELAY);
        }
    }

    _executeComputerTurn(playerId) {
        if (!this.gameState || this.gameState.gameOver) return;

        const hand = this.gameState.hands[playerId];
        const table = this.gameState.table;
        const hasPlayedInitial = this.gameState.hasPlayedInitialMeld[playerId] || false;

        const decision = computeComputerTurn(hand, table, hasPlayedInitial);

        if (decision.action === 'play') {
            const result = applyTurn(this.gameState, playerId, decision.newTable, decision.newRack);
            if (result.valid) {
                if (this.gameState.gameOver) {
                    this._handleLocalGameOver();
                    return;
                }
                advanceTurn(this.gameState);
            } else {
                // AI made an invalid move — fallback to draw
                console.warn(`[AI] ${playerId} made invalid move: ${result.error}. Drawing instead.`);
                drawTile(this.gameState, playerId);
                advanceTurn(this.gameState);
            }
        } else {
            // Draw a tile
            drawTile(this.gameState, playerId);
            advanceTurn(this.gameState);
        }

        // Update display
        this._sendLocalPlayerView();

        // If next player is also a computer, schedule their turn
        this._scheduleComputerTurnIfNeeded();
    }

    _handleLocalGameOver() {
        const scores = calculateScores(this.gameState);
        const winner = this.gameState.winner;
        const winnerPlayer = this.players.find(p => p.id === winner);
        const isMe = winner === this.myPlayerId;

        if (this.ui) {
            this.ui.showGameOver(
                isMe ? '🎉 You Win!' : `${winnerPlayer?.name || 'Someone'} Wins!`,
                isMe ? 'Congratulations! You placed all your tiles!' : `${winnerPlayer?.name} placed all their tiles.`,
                scores,
                this.players
            );
        }
    }

    // ========================
    // ONLINE GAME (P2P)
    // ========================

    async _createGame() {
        const nameInput = document.getElementById('player-name');
        const name = nameInput.value.trim();
        if (!name) {
            this._setLobbyStatus('Please enter your name', 'error');
            nameInput.focus();
            return;
        }

        this._setLobbyStatus('Creating game...', 'info');

        try {
            const gameCode = await this.network.createGame();
            this.isHost = true;
            this.isLocalGame = false;
            this.myPlayerId = gameCode;
            this.myName = name;
            this.gameCode = gameCode;
            this.players = [{ id: gameCode, name }];
            this.computerPlayerIds = new Set();

            this._showWaitingRoom();
        } catch (err) {
            this._setLobbyStatus(`Error: ${err.message}`, 'error');
        }
    }

    async _joinGame() {
        const nameInput = document.getElementById('join-name');
        const codeInput = document.getElementById('game-code');
        const name = nameInput.value.trim();
        const code = codeInput.value.trim();

        if (!name) {
            this._setLobbyStatus('Please enter your name', 'error');
            nameInput.focus();
            return;
        }
        if (!code) {
            this._setLobbyStatus('Please enter the game code', 'error');
            codeInput.focus();
            return;
        }

        this._setLobbyStatus('Joining game...', 'info');

        try {
            const peerId = await this.network.joinGame(code);
            this.isHost = false;
            this.isLocalGame = false;
            this.myPlayerId = peerId;
            this.myName = name;
            this.gameCode = code;
            this.computerPlayerIds = new Set();

            // Send join message to host
            this.network.sendToHost('lobby:join', { name, peerId });

            this._showWaitingRoom();
        } catch (err) {
            this._setLobbyStatus(`Error: ${err.message}`, 'error');
        }
    }

    _showWaitingRoom() {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('waiting-screen').classList.add('active');

        document.getElementById('display-game-code').textContent = this.gameCode;

        if (this.isHost) {
            document.getElementById('start-game-btn').style.display = 'inline-block';
            document.getElementById('waiting-message').textContent = 'Waiting for players to join...';
        } else {
            document.getElementById('start-game-btn').style.display = 'none';
            document.getElementById('waiting-message').textContent = 'Waiting for host to start the game...';
        }

        this._updatePlayerList();
    }

    _updatePlayerList() {
        const listEl = document.getElementById('player-list');
        listEl.innerHTML = '';

        for (const player of this.players) {
            const el = document.createElement('div');
            el.className = 'player-item';
            const isMe = player.id === this.myPlayerId;
            const isHost = player.id === this.gameCode;
            const isCpu = this.computerPlayerIds.has(player.id);
            el.innerHTML = `
                <span class="player-name">${player.name}${isMe ? ' (you)' : ''}${isHost ? ' 👑' : ''}${isCpu ? ' 🤖' : ''}</span>
            `;
            listEl.appendChild(el);
        }

        // Enable start button only if 2+ players
        const startBtn = document.getElementById('start-game-btn');
        if (this.isHost) {
            startBtn.disabled = this.players.length < 2;
        }
    }

    _copyGameCode() {
        navigator.clipboard.writeText(this.gameCode).then(() => {
            const btn = document.getElementById('copy-code-btn');
            btn.textContent = '✅';
            setTimeout(() => btn.textContent = '📋', 2000);
        });
    }

    _setLobbyStatus(text, type) {
        const el = document.getElementById('lobby-status');
        el.textContent = text;
        el.className = `status-message status-${type}`;
    }

    // ========================
    // GAME START
    // ========================

    _startGame() {
        if (!this.isHost || this.players.length < 2) return;

        const seed = Date.now();
        this.gameState = createGameState(this.players, seed);

        // Notify all players
        this.network.broadcast('lobby:start', { players: this.players });

        // Send each player their view
        this._sendAllPlayerViews();

        // Start local game UI
        this._initGameUI();
    }

    _initGameUI() {
        this.ui = new UIManager();
        this.ui.computerPlayerIds = new Set(this.computerPlayerIds);
        this.ui.showGameScreen();

        this.ui.onEndTurn = (newTable, newRack) => {
            if (this.isLocalGame) {
                this._handleLocalTurn(newTable, newRack);
            } else if (this.isHost) {
                this._handleTurnAsHost(this.myPlayerId, newTable, newRack);
            } else {
                this.network.sendToHost('game:turn', { table: newTable, rack: newRack });
            }
        };

        this.ui.onDrawTile = () => {
            if (this.isLocalGame) {
                this._handleLocalDraw();
            } else if (this.isHost) {
                this._handleDrawAsHost(this.myPlayerId);
            } else {
                this.network.sendToHost('game:draw', {});
            }
        };
    }

    // ========================
    // LOCAL GAME TURN HANDLING
    // ========================

    _handleLocalTurn(newTable, newRack) {
        const currentPlayer = getCurrentPlayer(this.gameState);
        if (currentPlayer.id !== this.myPlayerId) return;

        const result = applyTurn(this.gameState, this.myPlayerId, newTable, newRack);

        if (result.valid) {
            if (this.gameState.gameOver) {
                this._handleLocalGameOver();
                return;
            }
            advanceTurn(this.gameState);
            this._sendLocalPlayerView();
            this._scheduleComputerTurnIfNeeded();
        } else {
            if (this.ui) {
                this.ui._showMessage(result.error, 'error');
                this.ui._handleUndo();
            }
        }
    }

    _handleLocalDraw() {
        const currentPlayer = getCurrentPlayer(this.gameState);
        if (currentPlayer.id !== this.myPlayerId) return;

        drawTile(this.gameState, this.myPlayerId);
        advanceTurn(this.gameState);
        this._sendLocalPlayerView();
        this._scheduleComputerTurnIfNeeded();
    }

    // ========================
    // NETWORK HANDLERS
    // ========================

    _setupNetworkHandlers() {
        // === HOST handlers ===

        // New peer connected
        this.network.on('peer:connect', ({ peerId }) => {
            console.log('[App] Peer connected:', peerId);
        });

        // Guest sends join request
        this.network.on('lobby:join', ({ name, peerId }, fromPeerId) => {
            if (!this.isHost) return;

            // Add player to list
            const playerId = fromPeerId;
            this.players.push({ id: playerId, name });

            // Broadcast updated player list to all
            this.network.broadcast('lobby:player-list', { players: this.players });

            this._updatePlayerList();
        });

        // === GUEST handlers ===

        // Receive updated player list
        this.network.on('lobby:player-list', ({ players }) => {
            this.players = players;
            this._updatePlayerList();
        });

        // Game starting
        this.network.on('lobby:start', ({ players }) => {
            this.players = players;
            this._initGameUI();
        });

        // Receive game state update
        this.network.on('game:state', (view) => {
            view.myPlayerId = this.myPlayerId;
            if (this.ui) {
                this.ui.updateGameView(view);
            }
        });

        // Receive turn result
        this.network.on('game:turn-result', ({ valid, error }) => {
            if (!valid && error && this.ui) {
                this.ui._showMessage(error, 'error');
                this.ui._handleUndo();
            }
        });

        // Game over
        this.network.on('game:over', ({ scores, winner, players }) => {
            if (this.ui) {
                const winnerPlayer = players.find(p => p.id === winner);
                const isMe = winner === this.myPlayerId;
                this.ui.showGameOver(
                    isMe ? '🎉 You Win!' : `${winnerPlayer?.name || 'Someone'} Wins!`,
                    isMe ? 'Congratulations! You placed all your tiles!' : `${winnerPlayer?.name} placed all their tiles.`,
                    scores,
                    players
                );
            }
        });

        // === HOST game message handlers ===

        // Guest submits a turn
        this.network.on('game:turn', ({ table, rack }, fromPeerId) => {
            if (!this.isHost) return;
            this._handleTurnAsHost(fromPeerId, table, rack);
        });

        // Guest requests a draw
        this.network.on('game:draw', (data, fromPeerId) => {
            if (!this.isHost) return;
            this._handleDrawAsHost(fromPeerId);
        });

        // Peer disconnect
        this.network.on('peer:disconnect', ({ peerId }) => {
            console.log('[App] Peer disconnected:', peerId);
            // Could handle reconnection logic here
        });
    }

    // ========================
    // HOST GAME LOGIC (online)
    // ========================

    _handleTurnAsHost(playerId, newTable, newRack) {
        const currentPlayer = getCurrentPlayer(this.gameState);
        if (currentPlayer.id !== playerId) {
            this.network.sendTo(playerId, 'game:turn-result', {
                valid: false,
                error: 'Not your turn',
            });
            return;
        }

        const result = applyTurn(this.gameState, playerId, newTable, newRack);

        if (result.valid) {
            if (this.gameState.gameOver) {
                const scores = calculateScores(this.gameState);
                // Notify all players
                this.network.broadcast('game:over', {
                    scores,
                    winner: this.gameState.winner,
                    players: this.gameState.players,
                });
                // Also handle locally for host
                this.network.emit('game:over', {
                    scores,
                    winner: this.gameState.winner,
                    players: this.gameState.players,
                });
            } else {
                advanceTurn(this.gameState);
                this._sendAllPlayerViews();
            }
        } else {
            // Send error back to the player
            if (playerId === this.myPlayerId) {
                // Local host player
                if (this.ui) {
                    this.ui._showMessage(result.error, 'error');
                    this.ui._handleUndo();
                }
            } else {
                this.network.sendTo(playerId, 'game:turn-result', {
                    valid: false,
                    error: result.error,
                });
            }
        }
    }

    _handleDrawAsHost(playerId) {
        const currentPlayer = getCurrentPlayer(this.gameState);
        if (currentPlayer.id !== playerId) return;

        const tile = drawTile(this.gameState, playerId);
        advanceTurn(this.gameState);
        this._sendAllPlayerViews();
    }

    _sendAllPlayerViews() {
        for (const player of this.gameState.players) {
            const view = createPlayerView(this.gameState, player.id);
            view.myPlayerId = player.id;

            if (player.id === this.myPlayerId) {
                // Local host player
                if (this.ui) {
                    this.ui.updateGameView(view);
                }
            } else {
                this.network.sendTo(player.id, 'game:state', view);
            }
        }
    }

    // ========================
    // NAVIGATION
    // ========================

    _backToLobby() {
        // Clear any pending computer turn timeout
        if (this._computerTurnTimeout) {
            clearTimeout(this._computerTurnTimeout);
            this._computerTurnTimeout = null;
        }

        this.network.destroy();
        this.gameState = null;
        this.players = [];
        this.ui = null;
        this.isLocalGame = false;
        this.computerPlayerIds = new Set();

        document.getElementById('game-over-overlay').style.display = 'none';
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('lobby-screen').classList.add('active');
    }
}

// Initialize the app
const app = new RummikubApp();