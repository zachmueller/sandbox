/**
 * Stroke-Order Game - Game Logic
 */

(function () {
    "use strict";

    // === Constants ===
    const MAX_GUESSES = 6;
    const STROKE_COUNT = 7;
    const REVEAL_DELAY_MS = 300; // delay between each tile flip

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

    function pickCharacter() {
        // Use date-based seed for a "daily" character
        const today = new Date();
        const dateIndex =
            today.getFullYear() * 10000 +
            (today.getMonth() + 1) * 100 +
            today.getDate();
        const index = dateIndex % CHARACTER_LIST.length;
        return CHARACTER_LIST[index];
    }

    function pickRandomCharacter() {
        return CHARACTER_LIST[Math.floor(Math.random() * CHARACTER_LIST.length)];
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
                btn.textContent = stroke.name;
                btn.title = `${stroke.name} (${stroke.pinyin})`;
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

    // === Update Current Row Display ===
    function updateCurrentRow() {
        const rowEl = boardEl.querySelector(`.row[data-row="${currentRow}"]`);
        if (!rowEl) return;
        const cells = rowEl.querySelectorAll(".cell");

        cells.forEach((cell, i) => {
            // Remove old state
            cell.textContent = "";
            cell.classList.remove("filled");

            if (i < currentGuess.length) {
                cell.textContent = currentGuess[i];
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
            showGameOverModal(true);
        } else if (currentRow >= MAX_GUESSES) {
            gameOver = true;
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
        modalStrokes.textContent = `Strokes: ${targetEntry.strokes.join(" → ")}`;

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
        targetEntry = pickRandomCharacter();
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