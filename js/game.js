/**
 * Stroke-Order Game - Game Logic
 */

(function () {
    "use strict";

    // === Constants ===
    const MAX_GUESSES = 6;
    const STROKE_COUNT = 7;
    const REVEAL_DELAY_MS = 300; // delay between each tile flip

    // SVG path data for visual stroke shapes (viewBox: 0 0 32 32)
    const STROKE_SVG_PATHS = {
        "横":       "M4,16 L28,16",                                       // héng – horizontal
        "竖":       "M16,4 L16,28",                                       // shù – vertical
        "撇":       "M24,5 L8,28",                                        // piě – left-falling
        "捺":       "M8,5 Q16,14 26,28",                                  // nà – right-falling (slight curve)
        "点":       "M13,8 L18,22",                                       // diǎn – dot
        "提":       "M8,26 L24,8",                                        // tí – rising
        "横折":     "M4,10 L20,10 L20,28",                                // héngzhé – horizontal then turn down
        "竖折":     "M10,4 L10,20 L28,20",                                // shùzhé – vertical then turn right
        "横撇":     "M4,8 L22,8 L8,26",                                   // héngpiě – horizontal then left-fall
        "撇折":     "M24,4 L12,18 L28,28",                                // piězhé – left-fall then turn right
        "横折钩":   "M3,6 L20,6 L20,23 Q20,27 16,23",                    // héngzhégōu – horizontal-turn-hook
        "竖钩":     "M16,4 L16,24 Q16,28 11,24",                          // shùgōu – vertical-hook
        "斜钩":     "M10,4 Q16,14 24,26 Q26,28 28,24",                    // xiégōu – slanting-hook
        "竖弯钩":   "M8,4 L8,18 Q8,27 18,27 L24,27 Q27,27 27,22",        // shùwāngōu – vertical-curve-hook
        "横折折撇": "M2,6 L13,6 L13,16 L22,16 L10,28",                   // héngzhézhépiě – horizontal-turn-turn-left-fall
    };

    // === State ===
    let targetEntry = null; // { character, pinyin, meaning, strokeCount, strokes }
    let currentRow = 0;
    let currentGuess = []; // array of stroke names for current row
    let guesses = []; // array of submitted guesses
    let gameOver = false;
    let characterVisible = true;
    let paletteStates = {}; // stroke name → best known status ('correct'|'present'|'absent')

    // === DOM References ===
    const boardEl = document.getElementById("board");
    const messageBar = document.getElementById("message-bar");
    const submitBtn = document.getElementById("submit-btn");
    const undoBtn = document.getElementById("undo-btn");
    const clearBtn = document.getElementById("clear-btn");
    const hintBtn = document.getElementById("hint-btn");
    const toggleCharBtn = document.getElementById("toggle-char-btn");
    const targetCharEl = document.getElementById("target-character");
    const charPinyinEl = document.getElementById("character-pinyin");
    const paletteEl = document.getElementById("stroke-palette");
    const modal = document.getElementById("game-over-modal");
    const modalTitle = document.getElementById("modal-title");
    const modalMessage = document.getElementById("modal-message");
    const modalAnswer = document.getElementById("modal-answer");
    const modalPinyin = document.getElementById("modal-pinyin");
    const modalMeaning = document.getElementById("modal-meaning");
    const modalStrokes = document.getElementById("modal-strokes");
    const playAgainBtn = document.getElementById("play-again-btn");

    // === Initialization ===
    function init() {
        targetEntry = pickCharacter();
        currentRow = 0;
        currentGuess = [];
        guesses = [];
        gameOver = false;
        paletteStates = {};

        // Load character visibility from localStorage
        const stored = localStorage.getItem("strokeGame_charVisible");
        characterVisible = stored === null ? true : stored === "true";

        // Reset UI
        modal.classList.add("hidden");
        messageBar.classList.add("hidden");
        charPinyinEl.classList.add("hidden");
        charPinyinEl.textContent = "";

        updateCharacterDisplay();
        updateToggleButton();
        updateHintButton();
        buildBoard();
        buildPalette();
        updateActionButtons();
    }

    // === Session Tracking ===
    function getCompletedCharacters() {
        try {
            const stored = sessionStorage.getItem("strokeGame_completed");
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            return [];
        }
    }

    function addCompletedCharacter(character) {
        const completed = getCompletedCharacters();
        if (!completed.includes(character)) {
            completed.push(character);
        }
        // If all characters have been completed, reset the list
        // (keep only the just-completed one so it won't repeat immediately)
        if (completed.length >= CHARACTER_LIST.length) {
            sessionStorage.setItem("strokeGame_completed", JSON.stringify([character]));
        } else {
            sessionStorage.setItem("strokeGame_completed", JSON.stringify(completed));
        }
    }

    function pickCharacter() {
        const completed = getCompletedCharacters();
        // Filter to characters not yet completed in this session
        let available = CHARACTER_LIST.filter(
            (entry) => !completed.includes(entry.character)
        );
        // If all have been completed (or list is empty), allow any character
        if (available.length === 0) {
            available = CHARACTER_LIST;
        }
        return available[Math.floor(Math.random() * available.length)];
    }

    // === Board ===
    function buildBoard() {
        boardEl.innerHTML = "";
        for (let r = 0; r < MAX_GUESSES; r++) {
            const row = document.createElement("div");
            row.classList.add("row");
            row.dataset.row = r;
            for (let c = 0; c < STROKE_COUNT; c++) {
                const cell = document.createElement("div");
                cell.classList.add("cell");
                cell.dataset.col = c;
                row.appendChild(cell);
            }
            boardEl.appendChild(row);
        }
    }

    // === Stroke Palette ===
    function createStrokeSVG(strokeName) {
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("viewBox", "0 0 32 32");
        svg.setAttribute("width", "28");
        svg.setAttribute("height", "28");
        svg.classList.add("stroke-svg");

        const pathData = STROKE_SVG_PATHS[strokeName];
        if (pathData) {
            const path = document.createElementNS(svgNS, "path");
            path.setAttribute("d", pathData);
            path.setAttribute("fill", "none");
            path.setAttribute("stroke", "currentColor");
            path.setAttribute("stroke-width", "2.5");
            path.setAttribute("stroke-linecap", "round");
            path.setAttribute("stroke-linejoin", "round");
            svg.appendChild(path);
        }

        return svg;
    }

    function buildPalette() {
        paletteEl.innerHTML = "";

        // Group by category
        const categories = {};
        PALETTE_STROKES.forEach((s) => {
            if (!categories[s.category]) categories[s.category] = [];
            categories[s.category].push(s);
        });

        const categoryOrder = ["basic", "compound", "hook", "complex"];
        categoryOrder.forEach((cat) => {
            if (!categories[cat]) return;
            const group = document.createElement("div");
            group.classList.add("palette-group");
            categories[cat].forEach((stroke) => {
                const btn = document.createElement("button");
                btn.classList.add("stroke-btn");
                btn.dataset.stroke = stroke.name;
                btn.title = `${stroke.name} (${stroke.pinyin})`;

                // SVG visual shape
                const svg = createStrokeSVG(stroke.name);
                btn.appendChild(svg);

                // Small text label
                const label = document.createElement("span");
                label.classList.add("stroke-label");
                label.textContent = stroke.pinyin;
                btn.appendChild(label);

                btn.addEventListener("click", () => onStrokeClick(stroke.name));
                group.appendChild(btn);
            });
            paletteEl.appendChild(group);
        });
    }

    function updatePaletteColors() {
        const buttons = paletteEl.querySelectorAll(".stroke-btn");
        buttons.forEach((btn) => {
            const name = btn.dataset.stroke;
            btn.classList.remove("correct", "present", "absent");
            if (paletteStates[name]) {
                btn.classList.add(paletteStates[name]);
            }
        });
    }

    // === Character Display ===
    function updateCharacterDisplay() {
        if (characterVisible) {
            targetCharEl.textContent = targetEntry.character;
            targetCharEl.classList.remove("hidden-char");
        } else {
            targetCharEl.textContent = "?";
            targetCharEl.classList.add("hidden-char");
            // Hide pinyin hint when character is hidden
            charPinyinEl.classList.add("hidden");
            charPinyinEl.textContent = "";
        }
    }

    function updateToggleButton() {
        toggleCharBtn.textContent = characterVisible
            ? "👁 Hide Character"
            : "👁 Show Character";
    }

    function updateHintButton() {
        if (characterVisible) {
            hintBtn.style.display = "";
            hintBtn.disabled = false;
        } else {
            hintBtn.style.display = "none";
        }
    }

    // === Action Buttons ===
    function updateActionButtons() {
        undoBtn.disabled = gameOver || currentGuess.length === 0;
        clearBtn.disabled = gameOver || currentGuess.length === 0;
        submitBtn.disabled = gameOver || currentGuess.length !== STROKE_COUNT;
    }

    // === Stroke Click Handler ===
    function onStrokeClick(strokeName) {
        if (gameOver) return;
        if (currentGuess.length >= STROKE_COUNT) return;

        currentGuess.push(strokeName);
        updateCurrentRow();
        updateActionButtons();
    }

    // === Helper: create a small stroke SVG for cells/modal ===
    function createCellStrokeSVG(strokeName, size) {
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("viewBox", "0 0 32 32");
        svg.setAttribute("width", String(size || 24));
        svg.setAttribute("height", String(size || 24));
        svg.classList.add("cell-stroke-svg");

        const pathData = STROKE_SVG_PATHS[strokeName];
        if (pathData) {
            const path = document.createElementNS(svgNS, "path");
            path.setAttribute("d", pathData);
            path.setAttribute("fill", "none");
            path.setAttribute("stroke", "currentColor");
            path.setAttribute("stroke-width", "2.5");
            path.setAttribute("stroke-linecap", "round");
            path.setAttribute("stroke-linejoin", "round");
            svg.appendChild(path);
        }

        return svg;
    }

    // === Update Current Row Display ===
    function updateCurrentRow() {
        const rowEl = boardEl.querySelector(`.row[data-row="${currentRow}"]`);
        if (!rowEl) return;
        const cells = rowEl.querySelectorAll(".cell");

        cells.forEach((cell, i) => {
            // Remove old state
            cell.innerHTML = "";
            cell.classList.remove("filled");

            if (i < currentGuess.length) {
                cell.appendChild(createCellStrokeSVG(currentGuess[i], 28));
                cell.classList.add("filled");
            }
        });
    }

    // === Undo ===
    function onUndo() {
        if (gameOver || currentGuess.length === 0) return;
        currentGuess.pop();
        updateCurrentRow();
        updateActionButtons();
    }

    // === Clear ===
    function onClear() {
        if (gameOver || currentGuess.length === 0) return;
        currentGuess = [];
        updateCurrentRow();
        updateActionButtons();
    }

    // === Guess Evaluation (Wordle-style count-based) ===
    function evaluateGuess(guess, target) {
        const result = new Array(STROKE_COUNT);
        const targetRemaining = [...target];
        const guessRemaining = new Array(STROKE_COUNT).fill(true);

        // First pass: exact matches → green
        for (let i = 0; i < STROKE_COUNT; i++) {
            if (guess[i] === target[i]) {
                result[i] = { stroke: guess[i], status: "correct" };
                targetRemaining[i] = null;
                guessRemaining[i] = false;
            }
        }

        // Second pass: present (wrong position) or absent
        for (let i = 0; i < STROKE_COUNT; i++) {
            if (!guessRemaining[i]) continue;

            const idx = targetRemaining.indexOf(guess[i]);
            if (idx !== -1) {
                result[i] = { stroke: guess[i], status: "present" };
                targetRemaining[idx] = null;
            } else {
                result[i] = { stroke: guess[i], status: "absent" };
            }
        }

        return result;
    }

    // === Update palette state after evaluation ===
    function updatePaletteStates(evaluation) {
        // Priority: correct > present > absent
        const priority = { correct: 3, present: 2, absent: 1 };

        evaluation.forEach((e) => {
            const current = paletteStates[e.stroke];
            const currentPriority = current ? priority[current] : 0;
            const newPriority = priority[e.status];
            if (newPriority > currentPriority) {
                paletteStates[e.stroke] = e.status;
            }
        });
    }

    // === Reveal Animation ===
    function revealRow(rowIndex, evaluation) {
        return new Promise((resolve) => {
            const rowEl = boardEl.querySelector(`.row[data-row="${rowIndex}"]`);
            const cells = rowEl.querySelectorAll(".cell");

            let revealed = 0;
            cells.forEach((cell, i) => {
                setTimeout(() => {
                    cell.classList.add("reveal");
                    // Apply color at the midpoint of the flip
                    setTimeout(() => {
                        cell.classList.add(evaluation[i].status);
                    }, 250);

                    revealed++;
                    if (revealed === STROKE_COUNT) {
                        setTimeout(resolve, 300);
                    }
                }, i * REVEAL_DELAY_MS);
            });
        });
    }

    function shakeRow(rowIndex) {
        const rowEl = boardEl.querySelector(`.row[data-row="${rowIndex}"]`);
        rowEl.classList.add("shake");
        setTimeout(() => rowEl.classList.remove("shake"), 500);
    }

    // === Messages ===
    let messageTimeout = null;
    function showMessage(text, duration = 2000) {
        messageBar.textContent = text;
        messageBar.classList.remove("hidden");
        if (messageTimeout) clearTimeout(messageTimeout);
        if (duration > 0) {
            messageTimeout = setTimeout(() => {
                messageBar.classList.add("hidden");
            }, duration);
        }
    }

    // === Submit Guess ===
    async function submitGuess() {
        if (gameOver) return;
        if (currentGuess.length !== STROKE_COUNT) {
            showMessage(`Select all ${STROKE_COUNT} strokes before submitting`);
            shakeRow(currentRow);
            return;
        }

        // Disable interaction during animation
        submitBtn.disabled = true;
        undoBtn.disabled = true;
        clearBtn.disabled = true;
        disablePalette(true);

        const evaluation = evaluateGuess(currentGuess, targetEntry.strokes);
        await revealRow(currentRow, evaluation);

        // Update palette
        updatePaletteStates(evaluation);
        updatePaletteColors();

        guesses.push([...currentGuess]);
        currentRow++;

        const isWin = evaluation.every((e) => e.status === "correct");

        if (isWin) {
            gameOver = true;
            addCompletedCharacter(targetEntry.character);
            showGameOverModal(true);
        } else if (currentRow >= MAX_GUESSES) {
            gameOver = true;
            addCompletedCharacter(targetEntry.character);
            showGameOverModal(false);
        } else {
            // Reset for next guess
            currentGuess = [];
            disablePalette(false);
            updateActionButtons();
        }
    }

    function disablePalette(disabled) {
        const buttons = paletteEl.querySelectorAll(".stroke-btn");
        buttons.forEach((btn) => (btn.disabled = disabled));
    }

    // === Game Over Modal ===
    function showGameOverModal(won) {
        if (won) {
            modalTitle.textContent = "🎉 恭喜！Correct!";
            const tries = currentRow;
            modalMessage.textContent = `You guessed the stroke order in ${tries} ${tries === 1 ? "try" : "tries"}!`;
        } else {
            modalTitle.textContent = "😔 游戏结束 Game Over";
            modalMessage.textContent = "Better luck next time!";
        }

        modalAnswer.textContent = targetEntry.character;
        modalPinyin.textContent = targetEntry.pinyin;
        modalMeaning.textContent = `"${targetEntry.meaning}"`;
        // Build visual stroke sequence for modal
        modalStrokes.innerHTML = "";
        const label = document.createTextNode("Strokes: ");
        modalStrokes.appendChild(label);
        targetEntry.strokes.forEach((strokeName, idx) => {
            if (idx > 0) {
                const arrow = document.createTextNode(" → ");
                modalStrokes.appendChild(arrow);
            }
            const svg = createCellStrokeSVG(strokeName, 18);
            svg.style.verticalAlign = "middle";
            svg.style.display = "inline";
            modalStrokes.appendChild(svg);
        });

        modal.classList.remove("hidden");
    }

    // === Hint ===
    function showHint() {
        if (!characterVisible) return;
        charPinyinEl.textContent = targetEntry.pinyin;
        charPinyinEl.classList.remove("hidden");
    }

    // === Toggle Character Visibility ===
    function toggleCharacterVisibility() {
        characterVisible = !characterVisible;
        localStorage.setItem("strokeGame_charVisible", String(characterVisible));
        updateCharacterDisplay();
        updateToggleButton();
        updateHintButton();
    }

    // === Event Listeners ===
    submitBtn.addEventListener("click", submitGuess);
    undoBtn.addEventListener("click", onUndo);
    clearBtn.addEventListener("click", onClear);
    hintBtn.addEventListener("click", showHint);
    toggleCharBtn.addEventListener("click", toggleCharacterVisibility);

    playAgainBtn.addEventListener("click", () => {
        targetEntry = pickCharacter();
        currentRow = 0;
        currentGuess = [];
        guesses = [];
        gameOver = false;
        paletteStates = {};

        modal.classList.add("hidden");
        messageBar.classList.add("hidden");
        charPinyinEl.classList.add("hidden");
        charPinyinEl.textContent = "";

        updateCharacterDisplay();
        updateHintButton();
        buildBoard();
        buildPalette();
        updateActionButtons();
    });

    // === Start ===
    init();
})();