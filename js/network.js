/**
 * P2P Networking for Rummikub using PeerJS (WebRTC)
 * 
 * Architecture:
 * - Host creates a Peer and waits for connections
 * - Guests connect to the host's peer ID (game code)
 * - All game messages go through the host (star topology)
 * 
 * Message types:
 * - lobby:join         guest -> host (name)
 * - lobby:player-list  host -> all (player list)
 * - lobby:start        host -> all (game starting)
 * - game:state         host -> individual (player view)
 * - game:turn          guest -> host (proposed table + rack)
 * - game:draw          guest -> host (request draw)
 * - game:turn-result   host -> individual (valid/error)
 * - game:over          host -> all (final scores)
 */

export class NetworkManager {
    constructor() {
        this.peer = null;
        this.connections = new Map();   // peerId -> DataConnection
        this.hostConnection = null;     // DataConnection to host (if guest)
        this.isHost = false;
        this.playerId = null;
        this.handlers = {};
    }

    /**
     * Register a message handler
     */
    on(type, handler) {
        if (!this.handlers[type]) this.handlers[type] = [];
        this.handlers[type].push(handler);
    }

    /**
     * Emit to registered handlers
     */
    emit(type, data, fromPeerId) {
        const handlers = this.handlers[type] || [];
        for (const handler of handlers) {
            handler(data, fromPeerId);
        }
    }

    /**
     * Create a game as host
     * Returns a promise that resolves with the game code (peer ID)
     */
    createGame() {
        return new Promise((resolve, reject) => {
            // Generate a short, memorable game code
            const code = 'rummi-' + Math.random().toString(36).substring(2, 8);

            this.peer = new Peer(code, {
                debug: 1,
            });

            this.isHost = true;
            this.playerId = code;

            this.peer.on('open', (id) => {
                console.log('[Network] Host peer opened:', id);
                resolve(id);
            });

            this.peer.on('connection', (conn) => {
                this._setupConnection(conn);
            });

            this.peer.on('error', (err) => {
                console.error('[Network] Peer error:', err);
                if (err.type === 'unavailable-id') {
                    reject(new Error('Game code already in use. Try again.'));
                } else {
                    reject(err);
                }
            });
        });
    }

    /**
     * Join a game as guest
     * Returns a promise that resolves when connected
     */
    joinGame(gameCode) {
        return new Promise((resolve, reject) => {
            this.peer = new Peer(undefined, {
                debug: 1,
            });

            this.isHost = false;

            this.peer.on('open', (id) => {
                this.playerId = id;
                console.log('[Network] Guest peer opened:', id);

                const conn = this.peer.connect(gameCode, { reliable: true });

                conn.on('open', () => {
                    console.log('[Network] Connected to host');
                    this.hostConnection = conn;
                    this._setupConnection(conn);
                    resolve(id);
                });

                conn.on('error', (err) => {
                    console.error('[Network] Connection error:', err);
                    reject(err);
                });
            });

            this.peer.on('error', (err) => {
                console.error('[Network] Peer error:', err);
                if (err.type === 'peer-unavailable') {
                    reject(new Error('Game not found. Check the code and try again.'));
                } else {
                    reject(err);
                }
            });

            // Timeout after 10 seconds
            setTimeout(() => reject(new Error('Connection timed out')), 10000);
        });
    }

    /**
     * Setup event handlers for a data connection
     */
    _setupConnection(conn) {
        const peerId = conn.peer;

        conn.on('open', () => {
            this.connections.set(peerId, conn);
            this.emit('peer:connect', { peerId });
        });

        conn.on('data', (message) => {
            if (message && message.type) {
                this.emit(message.type, message.data, peerId);
            }
        });

        conn.on('close', () => {
            this.connections.delete(peerId);
            this.emit('peer:disconnect', { peerId });
        });

        conn.on('error', (err) => {
            console.error('[Network] Connection error with', peerId, err);
        });

        // If connection is already open (for host receiving connections)
        if (conn.open) {
            this.connections.set(peerId, conn);
            this.emit('peer:connect', { peerId });
        }
    }

    /**
     * Send a message to a specific peer
     */
    sendTo(peerId, type, data) {
        const conn = this.connections.get(peerId);
        if (conn && conn.open) {
            conn.send({ type, data });
        } else {
            console.warn('[Network] Cannot send to', peerId, '- not connected');
        }
    }

    /**
     * Send a message to the host (guest only)
     */
    sendToHost(type, data) {
        if (this.hostConnection && this.hostConnection.open) {
            this.hostConnection.send({ type, data });
        } else {
            console.warn('[Network] Cannot send to host - not connected');
        }
    }

    /**
     * Broadcast a message to all connected peers (host only)
     */
    broadcast(type, data) {
        for (const [peerId, conn] of this.connections) {
            if (conn.open) {
                conn.send({ type, data });
            }
        }
    }

    /**
     * Get all connected peer IDs
     */
    getConnectedPeers() {
        return Array.from(this.connections.keys());
    }

    /**
     * Destroy the peer connection
     */
    destroy() {
        if (this.peer) {
            this.peer.destroy();
            this.peer = null;
        }
        this.connections.clear();
        this.hostConnection = null;
    }
}