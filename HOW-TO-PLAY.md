# How to Play Rummikub P2P — Connection & Setup Guide

This guide walks through exactly how to host, join, and play a peer-to-peer Rummikub game with friends.

---

## Prerequisites

- **A modern web browser** (Chrome, Firefox, Edge, or Safari)
- **Internet connection** — both players need internet access for the WebRTC peer-to-peer connection to establish
- **The game URL** — all players need to open the same hosted version of the game (e.g., `https://your-site.com/` or `http://localhost:8080/` if running locally)

### Running Locally (Optional)

If you're running the game on your own machine, start a local web server:

```bash
# Using Python 3
python3 -m http.server 8080

# Using Node.js (npx)
npx serve .
```

Then open `http://localhost:8080` in your browser.

> **Note:** If running locally, only players on the same machine can access `localhost`. To play with others, either deploy the files to a web host or use a tunneling tool like [ngrok](https://ngrok.com/) to expose your local server.

---

## Step 1: Host Creates a Game

One player acts as the **host**. They create the game and share the game code with other players.

1. Open the game in your browser
2. In the **"Create a Game"** section at the top:
   - Enter your name in the **"Your name"** field
   - Click **"Create Game"**
3. You'll be taken to the **Waiting Room** screen
4. You'll see a **Game Code** displayed (e.g., `rummi-a3x7k2`)
5. **Share this code** with the friends you want to play with (via text, chat, email, etc.)
6. Click the **📋 button** next to the code to copy it to your clipboard for easy sharing

> 💡 **Tip:** The game code is automatically generated and unique to your session. It's used by other players to connect directly to your browser.

### What You'll See as Host

```
🎲 Waiting Room
Game Code: rummi-a3x7k2  [📋]

• YourName (you) 👑

[Start Game] (disabled until 2+ players join)
Waiting for players to join...
```

---

## Step 2: Other Players Join the Game

Each additional player joins using the game code the host shared.

1. Open the game in your browser (same URL as the host)
2. In the **"Join a Game"** section at the bottom:
   - Enter your name in the **"Your name"** field
   - Enter the **game code** the host shared in the **"Game code"** field
   - Click **"Join Game"**
3. You'll be taken to the **Waiting Room** where you can see all connected players

### What You'll See as a Joining Player

```
🎲 Waiting Room
Game Code: rummi-a3x7k2  [📋]

• HostName 👑
• YourName (you)

Waiting for host to start the game...
```

> **If you get an error:**
> - `"Game not found"` — Double-check the game code. Make sure the host's game is still active.
> - `"Connection timed out"` — The host may have closed their browser or there may be network issues. Ask the host to confirm their game is still running.

---

## Step 3: Host Starts the Game

Once all players have joined (minimum 2 players):

1. The **host** will see the player list updated with all connected players
2. The **"Start Game"** button becomes active (it's disabled until at least 2 players are present)
3. The host clicks **"Start Game"**
4. All players are automatically taken to the game screen
5. Each player is dealt **14 tiles** and the first player's turn begins

> ⚠️ **Only the host can start the game.** Other players will see "Waiting for host to start the game..." until the host clicks Start.

---

## Step 4: Playing the Game

### Understanding the Game Screen

The game screen has four main areas (top to bottom):

| Area | Description |
|------|-------------|
| **Top Bar** | Shows all players, their tile counts, whose turn it is, and how many tiles remain in the pool |
| **Table Area** | The shared table where melds (groups and runs) are placed — visible to all players |
| **Action Bar** | Buttons for sorting your tiles, undoing moves, drawing, and ending your turn |
| **Your Rack** | Your personal tiles — only you can see these |

### On Your Turn

When it's your turn, you'll see **"Your Turn!"** highlighted at the top. You have two options:

#### Option A: Place Tiles on the Table

1. **Drag a tile** from your rack to the table area to create a new meld
2. **Drag tiles onto existing melds** to add to them
3. **Rearrange tiles** within melds by dragging them to new positions
4. Once you've placed valid melds, click **"End Turn"**

> **Meld rules:**
> - **Group:** 3 or 4 tiles of the **same number** in **different colors**
> - **Run:** 3+ **consecutive numbers** of the **same color**
> - **Jokers (★):** Can substitute for any tile in any meld

#### Option B: Draw a Tile

If you can't (or don't want to) play, click **"Draw Tile"** to draw one tile from the pool and end your turn.

### Initial Meld Requirement

Your **first meld** must total **at least 30 points** using tiles from your own rack. Until you meet this requirement, you cannot manipulate existing table melds — you can only add new ones from your rack.

Point values:
- Number tiles = face value (1–13)
- Jokers = 30 points each

### Undo Button

If you've moved tiles around during your turn and want to reset, click **"Undo"** to restore the table and your rack to how they were at the start of your turn.

### Sort Buttons

- **Sort #** — Sorts your rack by number (ascending), then by color
- **Sort 🎨** — Sorts your rack by color, then by number

### When It's Not Your Turn

When it's another player's turn:
- You can see the table being updated after their turn
- Your action buttons (End Turn, Draw, Undo) are disabled
- The top bar shows whose turn it is

---

## Step 5: Winning the Game

The game ends when a player **places all their tiles** on the table (empty rack = win!).

### Scoring

| Player | Score |
|--------|-------|
| **Winner** | + sum of all other players' remaining tile values |
| **Other players** | − sum of their remaining tile values |

After the game ends, a **Game Over** overlay shows:
- Who won
- Final scores for all players
- A **"Back to Lobby"** button to return to the main screen and start a new game

---

## Connection Troubleshooting

| Issue | Solution |
|-------|----------|
| **"Game not found"** | Verify the game code is correct. Ensure the host hasn't closed their browser. |
| **"Connection timed out"** | Check your internet connection. Try refreshing and rejoining. The host may need to recreate the game. |
| **Game feels laggy** | P2P connections depend on both players' internet quality. Try a more stable network. |
| **Player disconnected** | If a player closes their browser, the game continues but that player can't reconnect. The host may need to restart. |
| **Can't connect at all** | Some corporate/school networks block WebRTC. Try from a different network or use a VPN. |

---

## Quick Reference — Game Flow Summary

```
┌─────────────────────────────────────────────────┐
│  HOST                     │  OTHER PLAYERS       │
├─────────────────────────────────────────────────┤
│  1. Enter name            │                      │
│  2. Click "Create Game"   │                      │
│  3. Share game code  ───────►  Receive code      │
│                           │  4. Enter name       │
│                           │  5. Enter game code  │
│                           │  6. Click "Join Game"│
│  7. See players join      │  7. See player list  │
│  8. Click "Start Game"    │  8. Game starts      │
│                                                  │
│  ═══════════ GAME IN PROGRESS ═══════════════    │
│                                                  │
│  Each turn: Place tiles OR Draw                  │
│  First meld must total ≥ 30 points               │
│  Win by emptying your rack!                      │
└─────────────────────────────────────────────────┘
```

---

## Supported Players

- **Minimum:** 2 players
- **Maximum:** No hard limit, but Rummikub is traditionally played with 2–4 players
- All players connect through the host (star topology) — the host's browser acts as the game server