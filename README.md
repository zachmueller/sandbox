# 2048 Web App Game

A simple, browser-based implementation of the classic **2048** sliding tile puzzle game.

## Overview

The goal of this project is to build a fully playable 2048 game as a single-page web application using HTML, CSS, and JavaScript. The game should be lightweight, responsive, and require no build tools or external dependencies to run — just open `index.html` in a browser.

## Game Rules

- The game is played on a **4×4 grid**.
- Each turn, a new tile (value **2** or **4**) appears in a random empty cell.
- The player slides all tiles in one of four directions (up, down, left, right) using arrow keys or swipe gestures.
- When two tiles with the **same number** collide during a slide, they **merge** into one tile with their combined value.
- The objective is to create a tile with the value **2048** (though play can continue beyond that).
- The game ends when no valid moves remain.

## Planned Features

- Clean, responsive 4×4 game grid
- Keyboard controls (arrow keys) for tile movement
- Touch/swipe support for mobile devices
- Score tracking with current and best score
- New game / restart functionality
- Win and game-over detection
- Smooth tile animations and transitions
- No external dependencies — pure HTML, CSS, and JavaScript