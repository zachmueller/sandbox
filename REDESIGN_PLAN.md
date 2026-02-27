# Stroke-Order Game Redesign Plan

## Overview

Transform the game from a Chinese idiom (成语) guessing game into a **stroke-order challenge**. Players are shown a Chinese character and must select its individual strokes in the correct order from a palette of fundamental stroke types.

## Core Concept

- **Target characters**: Chinese characters with exactly **7 strokes**
- **Gameplay**: Player taps/clicks stroke types from a palette in order, then submits their guess (entirely click-based, no text input)
- **Evaluation**: Same green/yellow/gray feedback system as before, but applied to stroke positions
- **Attempts**: 6 tries to get the correct stroke order
- **Character visibility**: Toggleable setting (default: **visible**). When visible, the player tests their stroke-order knowledge. When hidden, it becomes an extreme difficulty puzzle with no hints of any kind.
- **Replayability**: Unlimited replays; each replay picks a random character (no deduplication)

## Resolved Design Decisions

The following decisions were made during the design review to resolve ambiguities:

| # | Topic | Decision |
|---|-------|----------|
| 1 | **Yellow/repeated stroke handling** | Standard Wordle count-based matching. If the answer has 2 instances of 撇 and the player guesses 3, only 2 are marked green/yellow; the 3rd is gray. |
| 2 | **Palette button color state** | Stroke palette buttons update with best-known state after each guess (Wordle keyboard behavior). A stroke type is only grayed out on the palette if ALL instances in the answer are accounted for. |
| 3 | **Stroke data source** | Best-guess stroke-order data for the initial build. Data accuracy will be refined through iteration in future updates. |
| 4 | **Hidden character mode — hints** | When the target character is hidden, **no hints are available at all** (pinyin hint button is hidden/disabled). The extreme difficulty is intentional. |
| 5 | **Replay behavior** | Unlimited replays. Each replay picks a random character. No deduplication — the player may encounter the same character again. |
| 6 | **Submit button state** | Submit button is **disabled until exactly 7 strokes** are filled in the current row. |
| 7 | **Palette layout/grouping** | Exact grouping of stroke buttons is flexible (not strictly enforced). All palette buttons should ideally be visible at once without scrolling. |
| 8 | **Undo behavior** | Removes only the **single most recent stroke** from the current (un-submitted) row. |
| 9 | **Clear behavior** | Removes **all strokes** from the current (un-submitted) row. |
| 10 | **Post-submit editing** | Not allowed. Once a row is submitted, it cannot be modified. |
| 11 | **Reveal animation timing** | Total reveal duration stays roughly the same as the current 4-cell game (~2.1s). With 7 cells, each cell flips at ~300ms intervals. |
| 12 | **Mobile/responsive** | Not a high priority. Responsive requirements are lax for the initial build. |
| 13 | **Keyboard input** | None. The game is entirely tap/click-based via the stroke palette. No text input or IME needed. |

## Fundamental Stroke Types

Include all fundamental Chinese stroke types:

| Stroke | Name | Pinyin | Description |
|--------|------|--------|-------------|
| 横 | héng | héng | Horizontal |
| 竖 | shù | shù | Vertical |
| 撇 | piě | piě | Left-falling |
| 捺 | nà | nà | Right-falling |
| 点 | diǎn | diǎn | Dot |
| 提 | tí | tí | Rising |
| 横折 | héngzhé | héngzhé | Horizontal turning |
| 竖折 | shùzhé | shùzhé | Vertical turning |
| 横撇 | héngpiě | héngpiě | Horizontal left-falling |
| 撇折 | piězhé | piězhé | Left-falling turning |
| 横折钩 | héngzhégōu | héngzhégōu | Horizontal turning with hook |
| 竖钩 | shùgōu | shùgōu | Vertical hook |
| 弯钩 | wāngōu | wāngōu | Curved hook |
| 斜钩 | xiégōu | xiégōu | Slanted hook |
| 横折弯钩 | héngzhéwāngōu | héngzhéwāngōu | Horizontal turning curved hook |
| 竖弯钩 | shùwāngōu | shùwāngōu | Vertical curving hook |
| 横折折撇 | héngzhézhépiě | héngzhézhépiě | Horizontal double-turning left-falling |

> Note: The exact set included will be determined by which strokes appear in the selected 7-stroke characters. We will include only the stroke types that are actually used by characters in our data set, to avoid cluttering the palette with unused options.

## Data Model (`js/characters.js`)

Replace `js/words.js` with a character data file. Each entry contains:

```javascript
{
    character: "你",          // The character itself
    pinyin: "nǐ",            // Pronunciation
    meaning: "you",          // English meaning
    strokeCount: 7,          // Always 7 for our initial set
    strokes: [               // Ordered array of stroke names
        "撇", "竖", "撇", "横折钩", "竖", "横", "竖钩"
    ]
}
```

### Character Selection Criteria
- Exactly 7 strokes
- Common characters (HSK 1-4 level preferred)
- Varied stroke compositions (not all the same strokes)
- Target: 30-50 characters for the initial set

## Game Board Layout

```
┌─────────────────────────────────┐
│          汉字 Stroke Order       │
│   Guess the stroke order of a   │
│        Chinese character         │
├─────────────────────────────────┤
│                                 │
│         ┌───────────┐           │
│         │    你     │  ← Target character (toggleable visibility)
│         │  (pinyin) │  ← Optional hint
│         └───────────┘           │
│                                 │
│  ┌──┬──┬──┬──┬──┬──┬──┐       │
│  │  │  │  │  │  │  │  │  ← Current guess row (7 slots)
│  └──┴──┴──┴──┴──┴──┴──┘       │
│  (6 rows total for attempts)    │
│                                 │
│  [Undo] [Clear] [Submit]        │
│                                 │
│  ┌────────────────────────────┐ │
│  │  横  竖  撇  捺  点  提   │ ← Stroke palette (basic)
│  │  横折  竖折  横撇  撇折   │ ← Stroke palette (compound)
│  │  横折钩 竖钩 弯钩 斜钩 ...│ ← Stroke palette (hooks)
│  └────────────────────────────┘ │
│                                 │
│  [👁 Toggle Character] [💡 Hint]│ ← Settings/hints
│                                 │
└─────────────────────────────────┘
```

## Gameplay Flow

1. **Game start**: A 7-stroke character is selected (date-based for daily, random for replays)
2. **Character display**: Target character is shown (unless toggled off)
3. **Stroke selection**: Player clicks stroke buttons from the palette; each click appends a stroke to the current guess row (up to 7). No keyboard/text input — entirely click-based.
4. **Editing**: Player can use "Undo" to remove the single most recent stroke, or "Clear" to reset the entire current row. Submitted rows cannot be edited.
5. **Submission**: Player clicks "Submit" when 7 strokes are selected. **Submit button is disabled until all 7 slots are filled.**
6. **Evaluation**: Each stroke position is evaluated:
   - 🟩 **Green (correct)**: Correct stroke type in the correct position
   - 🟨 **Yellow (present)**: This stroke type appears in the answer but not at this position
   - ⬜ **Gray (absent)**: This stroke type does not appear in the remaining unmatched positions
7. **Reveal animation**: Same flip animation as current game, applied per stroke slot. Total duration stays roughly the same (~2.1s); each of the 7 cells flips at ~300ms intervals.
8. **Palette update**: After reveal, stroke palette button colors update to reflect best-known state (Wordle keyboard behavior). Stroke types are only fully grayed out when all instances are accounted for.
9. **Win/Lose**: Player wins by getting all 7 strokes correct, or loses after 6 attempts. Unlimited replays available from the game-over modal.

## Evaluation Logic

Standard Wordle-style evaluation with **count-based matching** for repeated stroke types:

```
1. First pass: Mark exact matches (correct stroke in correct position) → green
   - Mark matched positions as consumed in both guess and target
2. Second pass: For each remaining unmatched guess stroke, check if that stroke type 
   exists among remaining unmatched target strokes → yellow (consume one instance), 
   otherwise → gray
```

This means if the answer has 2 of a stroke type and the player guesses 3, only 2 will be green/yellow and the 3rd will be gray — identical to standard Wordle behavior.

## Settings

- **Toggle character visibility**: Default ON (visible). When OFF, character is hidden (replaced with "?") making the game extremely hard.
  - Stored in localStorage for persistence
  - When character is hidden: **no hints of any kind** are available (pinyin hint button is hidden/disabled)
- **Pinyin hint**: Button to reveal the character's pinyin. **Only available when character visibility is ON.**

## Files to Change

| File | Action | Description |
|------|--------|-------------|
| `js/words.js` | **Replace** → `js/characters.js` | Stroke-order data for 30-50 seven-stroke characters |
| `js/game.js` | **Rewrite** | Stroke selection logic, palette handling, evaluation, new board rendering, settings toggle |
| `index.html` | **Rewrite body** | New layout: character display, stroke slots grid, stroke palette buttons, settings, updated instructions |
| `css/style.css` | **Major update** | New styles for stroke palette buttons, stroke slots, character display area, settings toggle, responsive layout for wider grid (7 columns) |
| `README.md` | **Update** | New game description |

## Implementation Steps

1. **Create `js/characters.js`** — Build character list with verified stroke-order data for 30-50 seven-stroke characters
2. **Update `index.html`** — New layout with character display area, 6×7 stroke grid, stroke palette, action buttons, settings toggle, updated instructions
3. **Rewrite `js/game.js`** — New game logic:
   - Character selection (date-based + random replay)
   - Stroke palette click handling
   - Current guess state management (append, undo, clear)
   - Submission and evaluation
   - Reveal animation (adapted for 7 slots)
   - Win/lose detection and modal
   - Character visibility toggle (localStorage)
   - Hint system
4. **Update `css/style.css`** — Style all new components:
   - Stroke palette buttons (grouped by category)
   - 7-column grid (narrower cells to fit)
   - Character display area (large, prominent)
   - Settings toggle switch
   - Responsive design for mobile
5. **Test in browser** — Verify complete gameplay flow
6. **Update `README.md`** — Document new game mechanics
7. **Git commit** — Commit all changes

## Open Questions / Future Enhancements

- **Stroke visualization**: Could render SVG strokes instead of text labels for a more visual experience
- **Animated stroke building**: Show the character being "drawn" as correct strokes are revealed
- **Difficulty levels**: Characters with different stroke counts (5, 7, 9 strokes)
- **Stroke category hints**: Highlight which stroke categories are present in the answer
- **Daily challenge**: Keep date-based seeding for a daily character