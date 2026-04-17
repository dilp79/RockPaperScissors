/**
 * GameEngine — pure logic engine, fully decoupled from the DOM.
 * Exposes window.GameEngine via an IIFE.
 *
 * All DOM interaction is delegated to callbacks registered via setCallbacks().
 */
(function () {
    'use strict';

    // ---------------------------------------------------------------------------
    // Constants
    // ---------------------------------------------------------------------------
    const GRID_SIZE = 10;
    const ITEMS = ['stone', 'scissors', 'paper'];
    const STORAGE_KEY = 'scipaprock_best_score';
    const COMPUTER_STAGGER_MS = 200;

    // ---------------------------------------------------------------------------
    // State
    // ---------------------------------------------------------------------------
    let gameBoard = [];      // GRID_SIZE×GRID_SIZE, each cell: null | string
    let playerCells = [];    // [{row, col, item}]
    let score = 0;
    let bestScore = 0;
    let gameOver = false;
    let turnBusy = false;

    // Stats
    let turnsPlayed = 0;
    let totalPlaced = 0;
    let totalCleared = 0;

    // Callbacks
    let callbacks = {};

    // ---------------------------------------------------------------------------
    // Persistence helpers
    // ---------------------------------------------------------------------------
    function loadBestScore() {
        try {
            const v = localStorage.getItem(STORAGE_KEY);
            return v !== null ? parseInt(v, 10) : 0;
        } catch {
            return 0;
        }
    }

    function saveBestScore() {
        try {
            localStorage.setItem(STORAGE_KEY, String(bestScore));
        } catch {
            /* ignore */
        }
    }

    // ---------------------------------------------------------------------------
    // Callback helpers
    // ---------------------------------------------------------------------------
    function emit(name, ...args) {
        if (typeof callbacks[name] === 'function') {
            callbacks[name](...args);
        }
    }

    // ---------------------------------------------------------------------------
    // Game rules
    // ---------------------------------------------------------------------------
    /**
     * Returns true if item `a` beats item `b`.
     * stone > scissors, scissors > paper, paper > stone
     */
    function beats(a, b) {
        return (
            (a === 'stone' && b === 'scissors') ||
            (a === 'scissors' && b === 'paper') ||
            (a === 'paper' && b === 'stone')
        );
    }

    /**
     * Hex grid neighbours using even/odd row offset pattern.
     */
    function getNeighbors(row, col) {
        const isEvenRow = row % 2 === 0;
        const candidates = [
            { row: row - 1, col: isEvenRow ? col - 1 : col },
            { row: row - 1, col: isEvenRow ? col : col + 1 },
            { row: row,     col: col - 1 },
            { row: row,     col: col + 1 },
            { row: row + 1, col: isEvenRow ? col - 1 : col },
            { row: row + 1, col: isEvenRow ? col : col + 1 }
        ];
        return candidates.filter(
            n => n.row >= 0 && n.row < GRID_SIZE && n.col >= 0 && n.col < GRID_SIZE
        );
    }

    // ---------------------------------------------------------------------------
    // Difficulty
    // ---------------------------------------------------------------------------
    function getDifficulty() {
        if (score >= 60) return { label: 'very_hard', count: 6 };
        if (score >= 40) return { label: 'hard',      count: 5 };
        if (score >= 20) return { label: 'medium',    count: 4 };
        return                  { label: 'easy',      count: 3 };
    }

    // ---------------------------------------------------------------------------
    // Board helpers
    // ---------------------------------------------------------------------------
    function getEmptyCells() {
        const cells = [];
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (gameBoard[r][c] === null) cells.push({ row: r, col: c });
            }
        }
        return cells;
    }

    function isBoardFull() {
        return getEmptyCells().length === 0;
    }

    function getCellPreview(row, col, item) {
        if (
            row < 0 || row >= GRID_SIZE ||
            col < 0 || col >= GRID_SIZE ||
            !ITEMS.includes(item)
        ) {
            return null;
        }

        const occupied = gameBoard[row][col] !== null;
        const neighbors = getNeighbors(row, col);
        const captures = [];
        const threats = [];
        const threatItems = [];
        const seenThreatItems = new Set();

        for (const n of neighbors) {
            const nItem = gameBoard[n.row][n.col];
            if (!nItem) continue;

            if (beats(item, nItem)) {
                captures.push({ row: n.row, col: n.col, item: nItem });
            }

            if (beats(nItem, item)) {
                threats.push({ row: n.row, col: n.col, item: nItem });
                if (!seenThreatItems.has(nItem)) {
                    seenThreatItems.add(nItem);
                    threatItems.push(nItem);
                }
            }
        }

        const safeCaptures = threats.length === 0 ? captures : [];
        let statusKey = 'no_capture';
        let statusParams = {};

        if (safeCaptures.length > 0) {
            statusKey = 'safe_capture';
            statusParams = { n: safeCaptures.length };
        } else if (threatItems.length > 0) {
            statusKey = 'blocked_by';
            statusParams = { item: threatItems[0] };
        }

        return {
            row,
            col,
            item,
            occupied,
            captures: safeCaptures,
            threats,
            gain: safeCaptures.length,
            statusKey,
            statusParams
        };
    }

    // ---------------------------------------------------------------------------
    // Place a piece (internal — no DOM)
    // ---------------------------------------------------------------------------
    function placePiece(row, col, item, isPlayer) {
        if (gameBoard[row][col] !== null) return false;
        gameBoard[row][col] = item;
        if (isPlayer) {
            playerCells.push({ row, col, item });
            totalPlaced++;
        }
        emit('onPiecePlaced', row, col, item, isPlayer);
        return true;
    }

    // ---------------------------------------------------------------------------
    // Clear logic
    // ---------------------------------------------------------------------------
    function getCellsToClear() {
        const cellMap = new Map();

        for (const pc of playerCells) {
            const { row, col } = pc;
            const currentItem = gameBoard[row][col];
            if (!currentItem) continue;

            const preview = getCellPreview(row, col, currentItem);
            if (!preview) continue;

            for (const n of preview.captures) {
                cellMap.set(`${n.row}-${n.col}`, { row: n.row, col: n.col });
            }
        }

        return [...cellMap.values()];
    }

    function clearCells(cells) {
        for (const { row, col } of cells) {
            gameBoard[row][col] = null;
            playerCells = playerCells.filter(c => !(c.row === row && c.col === col));
        }
        totalCleared += cells.length;
    }

    function applyClears() {
        const cells = getCellsToClear();
        if (cells.length === 0) return 0;

        clearCells(cells);
        emit('onPiecesCleared', cells);

        score += cells.length;
        emit('onScoreChanged', score, bestScore);

        const diff = getDifficulty();
        emit('onDifficultyChanged', diff.label, diff.count);

        return cells.length;
    }

    // ---------------------------------------------------------------------------
    // Computer turn
    // ---------------------------------------------------------------------------
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function computerTurn() {
        const diff = getDifficulty();
        emit('onComputerTurnStart');
        emit('onDifficultyChanged', diff.label, diff.count);
        emit('onStatusChanged', 'computer_places', { n: diff.count });

        const itemsToPlace = diff.count;
        let itemsPlaced = 0;
        const maxAttempts = itemsToPlace * 4;
        let attempts = 0;

        while (itemsPlaced < itemsToPlace && attempts < maxAttempts) {
            attempts++;

            if (isBoardFull()) {
                endGame();
                emit('onComputerTurnEnd');
                return;
            }

            const emptyCells = getEmptyCells();
            if (emptyCells.length === 0) {
                endGame();
                emit('onComputerTurnEnd');
                return;
            }

            const randomItem = ITEMS[Math.floor(Math.random() * ITEMS.length)];
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];

            if (placePiece(randomCell.row, randomCell.col, randomItem, false)) {
                itemsPlaced++;
                await delay(COMPUTER_STAGGER_MS);
            }
        }

        applyClears();

        if (isBoardFull()) {
            endGame();
        } else {
            emit('onStatusChanged', 'your_turn');
        }

        emit('onComputerTurnEnd');
    }

    // ---------------------------------------------------------------------------
    // End game
    // ---------------------------------------------------------------------------
    function endGame() {
        gameOver = true;
        const isNewRecord = score > bestScore;
        if (isNewRecord) {
            bestScore = score;
            saveBestScore();
        }
        emit('onGameOver', {
            score,
            bestScore,
            isNewRecord,
            stats: { turnsPlayed, totalPlaced, totalCleared }
        });
    }

    // ---------------------------------------------------------------------------
    // Public API
    // ---------------------------------------------------------------------------

    function setCallbacks(cbs) {
        callbacks = Object.assign(callbacks, cbs);
    }

    /**
     * Resets board state without starting the game.
     * Does NOT run the first computer turn.
     */
    function initGame() {
        gameBoard = [];
        playerCells = [];
        score = 0;
        gameOver = false;
        turnBusy = false;
        turnsPlayed = 0;
        totalPlaced = 0;
        totalCleared = 0;

        for (let r = 0; r < GRID_SIZE; r++) {
            const row = [];
            for (let c = 0; c < GRID_SIZE; c++) {
                row.push(null);
            }
            gameBoard.push(row);
        }

        bestScore = loadBestScore();
        emit('onScoreChanged', score, bestScore);
    }

    /**
     * Inits board + runs first computer turn.
     */
    function startGame() {
        initGame();
        void computerTurn();
    }

    /**
     * Player places a piece.
     * Returns false immediately if: cell occupied, game over, or busy.
     * Returns a Promise<boolean> otherwise (true = move accepted & processed).
     */
    async function playerMove(row, col, item) {
        if (gameOver || turnBusy) return false;
        if (gameBoard[row][col] !== null) {
            emit('onStatusChanged', 'cell_occupied');
            return false;
        }

        turnBusy = true;
        turnsPlayed++;

        try {
            placePiece(row, col, item, true);

            applyClears();

            if (isBoardFull()) {
                endGame();
                return true;
            }

            await computerTurn();

            emit('onStatusChanged', 'your_turn');
            return true;
        } finally {
            turnBusy = false;
        }
    }

    // ---------------------------------------------------------------------------
    // Getters
    // ---------------------------------------------------------------------------
    function getBoard()     { return gameBoard.map(r => r.slice()); }
    function getScore()     { return score; }
    function getBestScore() { return bestScore; }
    function isGameOver()   { return gameOver; }
    function isBusy()       { return turnBusy; }
    function getGridSize()  { return GRID_SIZE; }

    // ---------------------------------------------------------------------------
    // Expose
    // ---------------------------------------------------------------------------
    window.GameEngine = {
        setCallbacks,
        startGame,
        playerMove,
        initGame,
        getBoard,
        getScore,
        getBestScore,
        isGameOver,
        isBusy,
        getGridSize,
        getNeighbors,
        getMovePreview: getCellPreview
    };
}());
