/**
 * Chinese Wordle - Game Logic
 */

(function () {
    "use strict";

    // === Constants ===
    const MAX_GUESSES = 6;
    const WORD_LENGTH = 4;
    const REVEAL_DELAY_MS = 300; // delay between each tile flip

    // === State ===
    let targetEntry = null; // { word, pinyin, meaning }
    let currentRow = 0;
    let guesses = [];
    let gameOver = false;

    // === DOM References ===
    const boardEl = document.getElementById("board");
    const inputEl = document.getElementById("guess-input");
    const submitBtn = document.getElementById("submit-btn");
    const messageBar = document.getElementById("message-bar");
    const hintBtn = document.getElementById("hint-btn");
    const hintText = document.getElementById("hint-text");
    const modal = document.getElementById("game-over-modal");
    const modalTitle = document.getElementById("modal-title");
    const modalMessage = document.getElementById("modal-message");
    const modalAnswer = document.getElementById("modal-answer");
    const modalPinyin = document.getElementById("modal-pinyin");
    const modalMeaning = document.getElementById("modal-meaning");
    const playAgainBtn = document.getElementById("play-again-btn");

    // === Initialization ===
    function init() {
        targetEntry = pickWord();
        currentRow = 0;
        guesses = [];
        gameOver = false;

        // Reset UI
        hintText.classList.add("hidden");
        hintText.textContent = "";
        modal.classList.add("hidden");
        messageBar.classList.add("hidden");
        inputEl.value = "";
        inputEl.disabled = false;
        submitBtn.disabled = false;
        inputEl.focus();

        buildBoard();
    }

    function pickWord() {
        // Use date-based seed for a "daily" word, with fallback to random
        const today = new Date();
        const dateIndex = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
        const index = dateIndex % WORD_LIST.length;
        return WORD_LIST[index];
    }

    function buildBoard() {
        boardEl.innerHTML = "";
        for (let r = 0; r < MAX_GUESSES; r++) {
            const row = document.createElement("div");
            row.classList.add("row");
            row.dataset.row = r;
            for (let c = 0; c < WORD_LENGTH; c++) {
                const cell = document.createElement("div");
                cell.classList.add("cell");
                cell.dataset.col = c;
                row.appendChild(cell);
            }
            boardEl.appendChild(row);
        }
    }

    // === Guess Evaluation ===
    // Returns an array of { char, status } where status is 'correct' | 'present' | 'absent'
    function evaluateGuess(guess, target) {
        const result = [];
        const targetChars = [...target];
        const guessChars = [...guess];
        const targetRemaining = [...targetChars];

        // First pass: find exact matches
        for (let i = 0; i < WORD_LENGTH; i++) {
            if (guessChars[i] === targetChars[i]) {
                result[i] = { char: guessChars[i], status: "correct" };
                targetRemaining[i] = null; // consumed
            } else {
                result[i] = { char: guessChars[i], status: null };
            }
        }

        // Second pass: find present (wrong position) matches
        for (let i = 0; i < WORD_LENGTH; i++) {
            if (result[i].status !== null) continue;

            const idx = targetRemaining.indexOf(guessChars[i]);
            if (idx !== -1) {
                result[i].status = "present";
                targetRemaining[idx] = null; // consumed
            } else {
                result[i].status = "absent";
            }
        }

        return result;
    }

    // === Rendering ===
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
                    if (revealed === WORD_LENGTH) {
                        setTimeout(resolve, 300);
                    }
                }, i * REVEAL_DELAY_MS);
            });
        });
    }

    function fillRow(rowIndex, chars) {
        const rowEl = boardEl.querySelector(`.row[data-row="${rowIndex}"]`);
        const cells = rowEl.querySelectorAll(".cell");
        chars.forEach((ch, i) => {
            cells[i].textContent = ch;
            cells[i].classList.add("filled");
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

    // === Validation ===
    function isChinese(str) {
        // Match CJK Unified Ideographs
        return /^[\u4e00-\u9fff]+$/.test(str);
    }

    function isValidGuess(guess) {
        if (guess.length !== WORD_LENGTH) return false;
        if (!isChinese(guess)) return false;
        return true;
    }

    // === Submit Guess ===
    async function submitGuess() {
        if (gameOver) return;

        const guess = inputEl.value.trim();

        if (guess.length !== WORD_LENGTH) {
            showMessage(`请输入 ${WORD_LENGTH} 个汉字 (Enter ${WORD_LENGTH} characters)`);
            shakeRow(currentRow);
            return;
        }

        if (!isChinese(guess)) {
            showMessage("请输入中文汉字 (Please enter Chinese characters)");
            shakeRow(currentRow);
            return;
        }

        // Disable input during animation
        inputEl.disabled = true;
        submitBtn.disabled = true;

        const guessChars = [...guess];
        fillRow(currentRow, guessChars);

        const evaluation = evaluateGuess(guess, targetEntry.word);
        await revealRow(currentRow, evaluation);

        guesses.push(guess);
        currentRow++;

        const isWin = evaluation.every((e) => e.status === "correct");

        if (isWin) {
            gameOver = true;
            showGameOverModal(true);
        } else if (currentRow >= MAX_GUESSES) {
            gameOver = true;
            showGameOverModal(false);
        } else {
            // Re-enable input for next guess
            inputEl.disabled = false;
            submitBtn.disabled = false;
            inputEl.value = "";
            inputEl.focus();
        }
    }

    // === Game Over Modal ===
    function showGameOverModal(won) {
        if (won) {
            modalTitle.textContent = "🎉 恭喜！Correct!";
            const tries = currentRow;
            modalMessage.textContent = `You guessed it in ${tries} ${tries === 1 ? "try" : "tries"}!`;
        } else {
            modalTitle.textContent = "😔 游戏结束 Game Over";
            modalMessage.textContent = "Better luck next time!";
        }

        modalAnswer.textContent = targetEntry.word;
        modalPinyin.textContent = targetEntry.pinyin;
        modalMeaning.textContent = `"${targetEntry.meaning}"`;

        modal.classList.remove("hidden");
    }

    // === Hint ===
    function showHint() {
        hintText.textContent = targetEntry.pinyin;
        hintText.classList.remove("hidden");
    }

    // === Event Listeners ===
    submitBtn.addEventListener("click", submitGuess);

    inputEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            submitGuess();
        }
    });

    // Limit input to 4 characters
    inputEl.addEventListener("input", () => {
        const chars = [...inputEl.value];
        if (chars.length > WORD_LENGTH) {
            inputEl.value = chars.slice(0, WORD_LENGTH).join("");
        }
    });

    hintBtn.addEventListener("click", showHint);

    playAgainBtn.addEventListener("click", () => {
        // Pick a random word instead of the daily word for replays
        targetEntry = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
        currentRow = 0;
        guesses = [];
        gameOver = false;
        hintText.classList.add("hidden");
        hintText.textContent = "";
        modal.classList.add("hidden");
        messageBar.classList.add("hidden");
        inputEl.value = "";
        inputEl.disabled = false;
        submitBtn.disabled = false;
        buildBoard();
        inputEl.focus();
    });

    // === Start ===
    init();
})();