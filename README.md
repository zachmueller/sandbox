# 汉字 Stroke Order Game

A web-based stroke-order challenge game inspired by [Wordle](https://www.nytimes.com/games/wordle/index.html). Players are shown a Chinese character and must guess the correct order of its strokes.

## How to Play

1. A Chinese character with **7 strokes** is displayed
2. Select strokes from the palette by clicking — each click appends a stroke to your current guess row
3. Fill all 7 slots, then click **Submit**
4. Feedback is given for each position using Wordle-style color coding:
   - 🟩 **Green** — Correct stroke in the correct position
   - 🟨 **Yellow** — Stroke appears in the answer but in a different position
   - ⬜ **Gray** — Stroke does not appear (or all instances are accounted for)
5. You have **6 attempts** to get the correct stroke order
6. Use **Undo** to remove the last stroke, or **Clear** to reset the current row

## Features

- **45 characters** with 7-stroke compositions (common HSK-level characters)
- **17 stroke types** across basic, compound, hook, and complex categories
- **Character visibility toggle** — hide the character for extreme difficulty (no hints available in hidden mode)
- **Pinyin hint** — reveal pronunciation when character is visible
- **Palette color tracking** — stroke buttons update with best-known status after each guess (Wordle keyboard behavior)
- **Unlimited replays** — each replay picks a random character
- **Daily challenge** — date-based character selection for the first game

## Tech Stack

- Pure HTML, CSS, and JavaScript — no frameworks or build tools
- Runs entirely in the browser — just open `index.html`

## Files

| File | Description |
|------|-------------|
| `index.html` | Game layout and structure |
| `css/style.css` | Dark-theme styling for board, palette, and UI |
| `js/characters.js` | Character data with stroke-order sequences |
| `js/game.js` | Game logic: selection, evaluation, animation, state |

## Running

Open `index.html` in any modern browser. No server or build step required.