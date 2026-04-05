document.addEventListener('DOMContentLoaded', () => {
    const GRID_SIZE = 10;
    const ITEMS = ['stone', 'scissors', 'paper'];
    const STORAGE_KEY = 'scipaprock_best_score';

    let score = 0;
    let selectedItem = null;
    let gameBoard = [];
    let playerCells = [];
    let gameOver = false;
    let userInteracted = false;
    let gameStarted = false;
    let turnBusy = false;

    const buttonClickSound = document.getElementById('buttonClickSound');
    const victorySound = document.getElementById('victorySound');

    buttonClickSound.load();
    victorySound.load();

    const hexGrid = document.getElementById('hexGrid');
    const scoreElement = document.getElementById('score');
    const bestScoreElement = document.getElementById('bestScore');
    const gameStatus = document.getElementById('gameStatus');
    const endGameMessage = document.getElementById('endGameMessage');
    const startGameMessage = document.getElementById('startGameMessage');
    const finalScore = document.getElementById('finalScore');
    const bestScoreFinal = document.getElementById('bestScoreFinal');
    const restartButton = document.getElementById('restartButton');
    const startButton = document.getElementById('startButton');
    const itemElements = document.querySelectorAll('.item');
    const difficultyElement = document.getElementById('difficulty');

    function loadBestScore() {
        try {
            const v = localStorage.getItem(STORAGE_KEY);
            return v !== null ? parseInt(v, 10) : 0;
        } catch {
            return 0;
        }
    }

    let bestScore = loadBestScore();

    function saveBestScore() {
        try {
            localStorage.setItem(STORAGE_KEY, String(bestScore));
        } catch {
            /* ignore */
        }
    }

    function refreshBestScoreDisplay() {
        if (bestScoreElement) bestScoreElement.textContent = String(bestScore);
    }

    refreshBestScoreDisplay();

    startGameMessage.style.display = 'flex';
    startGameMessage.setAttribute('aria-hidden', 'false');

    function figuresPhrase(n) {
        const m10 = n % 10;
        const m100 = n % 100;
        if (m10 === 1 && m100 !== 11) return `${n} фигуру`;
        if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return `${n} фигуры`;
        return `${n} фигур`;
    }

    startButton.addEventListener('click', () => {
        startGameMessage.style.display = 'none';
        startGameMessage.setAttribute('aria-hidden', 'true');
        userInteracted = true;
        gameStarted = true;
        initGame();
        playSound(buttonClickSound);
    });

    function playSound(sound) {
        if (!userInteracted) return;
        sound.currentTime = 0;
        sound.play().catch(() => {});
    }

    itemElements.forEach(item => {
        item.addEventListener('click', () => {
            userInteracted = true;
            selectItem(item.dataset.item);
        });
    });

    restartButton.addEventListener('click', () => {
        endGameMessage.style.display = 'none';
        endGameMessage.setAttribute('aria-hidden', 'true');
        initGame();
        playSound(buttonClickSound);
    });

    document.addEventListener('click', () => {
        userInteracted = true;
    }, { once: true });

    document.addEventListener('keydown', onKeydown);

    function onKeydown(e) {
        if (gameOver || !gameStarted) return;
        userInteracted = true;
        if (e.key === '1' || e.key === 'Digit1') selectItem('stone');
        else if (e.key === '2' || e.key === 'Digit2') selectItem('scissors');
        else if (e.key === '3' || e.key === 'Digit3') selectItem('paper');
        else if (e.key === 'Escape') {
            selectedItem = null;
            itemElements.forEach(el => {
                el.classList.remove('selected');
                el.setAttribute('aria-pressed', 'false');
            });
            gameStatus.textContent = 'Выберите фигуру и клетку на поле';
        }
    }

    function initGame() {
        hexGrid.innerHTML = '';
        gameBoard = [];
        playerCells = [];
        score = 0;
        gameOver = false;
        scoreElement.textContent = score;
        selectedItem = null;

        itemElements.forEach(item => {
            item.classList.remove('selected');
            item.setAttribute('aria-pressed', 'false');
        });

        for (let row = 0; row < GRID_SIZE; row++) {
            const rowArray = [];
            const rowElement = document.createElement('div');
            rowElement.className = 'hexagon-row';

            for (let col = 0; col < GRID_SIZE; col++) {
                const hex = document.createElement('button');
                hex.type = 'button';
                hex.className = 'hexagon';
                hex.dataset.row = String(row);
                hex.dataset.col = String(col);
                hex.dataset.item = '';
                hex.classList.add('hexagon--empty');
                hex.setAttribute('aria-label', `Клетка ${row + 1}, ${col + 1}, пусто`);

                hex.addEventListener('click', () => {
                    void handleHexClick(row, col);
                });

                rowElement.appendChild(hex);
                rowArray.push(null);
            }

            hexGrid.appendChild(rowElement);
            gameBoard.push(rowArray);
        }

        if (gameStarted) {
            void computerTurn();
        }
    }

    function selectItem(item) {
        selectedItem = item;
        itemElements.forEach(el => {
            const on = el.dataset.item === item;
            el.classList.toggle('selected', on);
            el.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        gameStatus.textContent = `Выбран ${getItemName(item)}. Укажите клетку (1–3 — фигура, Esc — отмена).`;
    }

    async function handleHexClick(row, col) {
        if (turnBusy || gameOver || !selectedItem) return;
        const hexEl = document.querySelector(`.hexagon[data-row="${row}"][data-col="${col}"]`);
        if (hexEl && hexEl.classList.contains('is-clearing')) return;

        if (gameBoard[row][col] !== null) {
            gameStatus.textContent = 'Клетка занята. Выберите пустую.';
            return;
        }

        userInteracted = true;
        turnBusy = true;

        try {
            placeItem(row, col, selectedItem, true);

            const clearedCells = await checkAndClearBoard();
            if (clearedCells > 0) {
                score += clearedCells;
                scoreElement.textContent = score;
                updateDifficulty();
            }

            if (isBoardFull()) {
                endGame();
                return;
            }

            await computerTurn();

            selectedItem = null;
            itemElements.forEach(el => {
                el.classList.remove('selected');
                el.setAttribute('aria-pressed', 'false');
            });
            gameStatus.textContent = 'Выберите фигуру и клетку на поле';
        } finally {
            turnBusy = false;
        }
    }

    function placeItem(row, col, item, isPlayer = false) {
        if (gameBoard[row][col] !== null) return false;

        gameBoard[row][col] = item;

        if (isPlayer) {
            playerCells.push({ row, col, item });
        }

        const hexElement = document.querySelector(`.hexagon[data-row="${row}"][data-col="${col}"]`);
        if (!hexElement) {
            gameBoard[row][col] = null;
            if (isPlayer) {
                playerCells = playerCells.filter(c => !(c.row === row && c.col === col));
            }
            return false;
        }

        const img = document.createElement('img');
        img.src = `${item}.png`;
        img.alt = getItemName(item);
        img.decoding = 'async';
        if (isPlayer) img.classList.add('player-item');

        hexElement.innerHTML = '';
        hexElement.appendChild(img);
        hexElement.classList.remove('hexagon--empty');
        hexElement.classList.remove('pop-in');
        void hexElement.offsetWidth;
        hexElement.classList.add('pop-in');
        hexElement.dataset.item = item;
        hexElement.setAttribute(
            'aria-label',
            `Клетка ${row + 1}, ${col + 1}: ${getItemName(item)}${isPlayer ? ', ваша фигура' : ', компьютер'}`
        );

        playSound(buttonClickSound);
        return true;
    }

    async function computerTurn() {
        let itemsToPlace = 3;
        let difficultyLabel = 'Лёгкая';

        if (score >= 60) {
            itemsToPlace = 6;
            difficultyLabel = 'Очень сложная';
        } else if (score >= 40) {
            itemsToPlace = 5;
            difficultyLabel = 'Сложная';
        } else if (score >= 20) {
            itemsToPlace = 4;
            difficultyLabel = 'Средняя';
        }

        difficultyElement.textContent = `${difficultyLabel} (${figuresPhrase(itemsToPlace)})`;
        gameStatus.textContent = `Компьютер размещает ${figuresPhrase(itemsToPlace)}…`;

        let itemsPlaced = 0;
        const maxAttempts = itemsToPlace * 4;
        let attempts = 0;

        while (itemsPlaced < itemsToPlace && attempts < maxAttempts) {
            attempts++;

            if (isBoardFull()) {
                endGame();
                return;
            }

            const randomItem = ITEMS[Math.floor(Math.random() * ITEMS.length)];
            const emptyCells = getEmptyCells();
            if (emptyCells.length === 0) {
                endGame();
                return;
            }

            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            if (placeItem(randomCell.row, randomCell.col, randomItem, false)) {
                itemsPlaced++;
            }
        }

        const clearedCells = await checkAndClearBoard();
        if (clearedCells > 0) {
            score += clearedCells;
            scoreElement.textContent = score;
            updateDifficulty();
        }

        if (isBoardFull()) {
            endGame();
        } else {
            gameStatus.textContent = 'Выберите фигуру и клетку на поле';
        }
    }

    function getEmptyCells() {
        const emptyCells = [];
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                if (gameBoard[row][col] === null) {
                    emptyCells.push({ row, col });
                }
            }
        }
        return emptyCells;
    }

    function isBoardFull() {
        return getEmptyCells().length === 0;
    }

    function getNeighbors(row, col) {
        const isEvenRow = row % 2 === 0;
        const neighbors = [
            { row: row - 1, col: isEvenRow ? col - 1 : col },
            { row: row - 1, col: isEvenRow ? col : col + 1 },
            { row: row, col: col - 1 },
            { row: row, col: col + 1 },
            { row: row + 1, col: isEvenRow ? col - 1 : col },
            { row: row + 1, col: isEvenRow ? col : col + 1 }
        ];

        return neighbors.filter(
            n => n.row >= 0 && n.row < GRID_SIZE && n.col >= 0 && n.col < GRID_SIZE
        );
    }

    async function checkAndClearBoard() {
        const cellsToClear = [];

        for (const playerCell of playerCells) {
            const { row, col } = playerCell;
            const currentItem = gameBoard[row][col];
            if (!currentItem) continue;

            const neighbors = getNeighbors(row, col);
            let hasWinner = false;
            let hasLoser = false;

            for (const neighbor of neighbors) {
                const neighborItem = gameBoard[neighbor.row][neighbor.col];
                if (!neighborItem) continue;

                if (
                    (currentItem === 'stone' && neighborItem === 'scissors') ||
                    (currentItem === 'scissors' && neighborItem === 'paper') ||
                    (currentItem === 'paper' && neighborItem === 'stone')
                ) {
                    hasWinner = true;
                }

                if (
                    (currentItem === 'stone' && neighborItem === 'paper') ||
                    (currentItem === 'scissors' && neighborItem === 'stone') ||
                    (currentItem === 'paper' && neighborItem === 'scissors')
                ) {
                    hasLoser = true;
                }
            }

            if (hasWinner && !hasLoser) {
                for (const neighbor of neighbors) {
                    const neighborItem = gameBoard[neighbor.row][neighbor.col];
                    if (!neighborItem) continue;

                    if (
                        (currentItem === 'stone' && neighborItem === 'scissors') ||
                        (currentItem === 'scissors' && neighborItem === 'paper') ||
                        (currentItem === 'paper' && neighborItem === 'stone')
                    ) {
                        cellsToClear.push(neighbor);
                    }
                }
            }
        }

        const uniqueCellsToClear = [
            ...new Map(cellsToClear.map(cell => [`${cell.row}-${cell.col}`, cell])).values()
        ];

        if (uniqueCellsToClear.length > 0) {
            playSound(victorySound);
            await Promise.all(uniqueCellsToClear.map(cell => clearCellAsync(cell.row, cell.col)));
        }

        return uniqueCellsToClear.length;
    }

    function clearCellAsync(row, col) {
        return new Promise(resolve => {
            const hexElement = document.querySelector(`.hexagon[data-row="${row}"][data-col="${col}"]`);
            const reduceMotion =
                typeof window.matchMedia === 'function' &&
                window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            const finish = () => {
                gameBoard[row][col] = null;
                playerCells = playerCells.filter(c => !(c.row === row && c.col === col));
                if (hexElement) {
                    hexElement.innerHTML = '';
                    hexElement.classList.remove('is-clearing', 'pop-in');
                    hexElement.classList.add('hexagon--empty');
                    hexElement.dataset.item = '';
                    hexElement.setAttribute('aria-label', `Клетка ${row + 1}, ${col + 1}, пусто`);
                }
                resolve();
            };

            if (!hexElement) {
                gameBoard[row][col] = null;
                playerCells = playerCells.filter(c => !(c.row === row && c.col === col));
                resolve();
                return;
            }

            const img = hexElement.querySelector('img');
            if (!img || reduceMotion) {
                finish();
                return;
            }

            let done = false;
            const safeFinish = () => {
                if (done) return;
                done = true;
                finish();
            };

            hexElement.classList.add('is-clearing');
            img.classList.add('piece-vanish');

            const ms = 420;
            const t = window.setTimeout(safeFinish, ms);
            img.addEventListener(
                'animationend',
                () => {
                    window.clearTimeout(t);
                    safeFinish();
                },
                { once: true }
            );
        });
    }

    function endGame() {
        gameOver = true;
        if (score > bestScore) {
            bestScore = score;
            saveBestScore();
            refreshBestScoreDisplay();
        }
        finalScore.textContent = score;
        if (bestScoreFinal) bestScoreFinal.textContent = String(bestScore);
        endGameMessage.style.display = 'flex';
        endGameMessage.setAttribute('aria-hidden', 'false');
        restartButton.focus();
    }

    function getItemName(item) {
        switch (item) {
            case 'stone':
                return 'Камень';
            case 'scissors':
                return 'Ножницы';
            case 'paper':
                return 'Бумага';
            default:
                return '';
        }
    }

    function updateDifficulty() {
        let itemsToPlace = 3;
        let difficultyLabel = 'Лёгкая';
        if (score >= 60) {
            itemsToPlace = 6;
            difficultyLabel = 'Очень сложная';
        } else if (score >= 40) {
            itemsToPlace = 5;
            difficultyLabel = 'Сложная';
        } else if (score >= 20) {
            itemsToPlace = 4;
            difficultyLabel = 'Средняя';
        }
        difficultyElement.textContent = `${difficultyLabel} (${figuresPhrase(itemsToPlace)})`;
    }
});
