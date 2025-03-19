document.addEventListener('DOMContentLoaded', () => {
    // Константы и переменные игры
    const GRID_SIZE = 10;
    const ITEMS = ['stone', 'scissors', 'paper'];
    let score = 0;
    let selectedItem = null;
    let gameBoard = []; // 2D массив для хранения состояния игры
    let playerCells = []; // Массив клеток, размещенных игроком
    let gameOver = false;
    let userInteracted = false; // Флаг для отслеживания первого взаимодействия пользователя
    let gameStarted = false; // Флаг для отслеживания начала игры

    // Звуки
    const buttonClickSound = document.getElementById('buttonClickSound');
    const victorySound = document.getElementById('victorySound');

    // Предзагрузка звуков без воспроизведения
    buttonClickSound.load();
    victorySound.load();

    // Элементы DOM
    const hexGrid = document.getElementById('hexGrid');
    const scoreElement = document.getElementById('score');
    const gameStatus = document.getElementById('gameStatus');
    const endGameMessage = document.getElementById('endGameMessage');
    const startGameMessage = document.getElementById('startGameMessage');
    const finalScore = document.getElementById('finalScore');
    const restartButton = document.getElementById('restartButton');
    const startButton = document.getElementById('startButton');
    const itemElements = document.querySelectorAll('.item');
    const difficultyElement = document.getElementById('difficulty');

    // Показываем стартовый экран
    startGameMessage.style.display = 'flex';

    // Обработчик кнопки "Начать игру"
    startButton.addEventListener('click', () => {
        startGameMessage.style.display = 'none';
        userInteracted = true;
        gameStarted = true;
        initGame();
        playSound(buttonClickSound); // Воспроизводим звук для подтверждения активации звуков
    });

    // Функция для безопасного воспроизведения звука
    function playSound(sound) {
        if (userInteracted) {
            sound.play().catch(error => {
                console.log("Ошибка воспроизведения звука:", error);
            });
        }
    }

    // Обработчики событий
    itemElements.forEach(item => {
        item.addEventListener('click', () => {
            userInteracted = true; // Пользователь взаимодействовал с игрой
            selectItem(item.dataset.item);
        });
    });

    restartButton.addEventListener('click', () => {
        endGameMessage.style.display = 'none';
        initGame();
        playSound(buttonClickSound); // Воспроизводим звук при перезапуске
    });

    // Добавляем обработчики для фиксации первого взаимодействия пользователя
    document.addEventListener('click', () => {
        userInteracted = true;
    }, { once: true });

    document.addEventListener('keydown', () => {
        userInteracted = true;
    }, { once: true });

    // Функции игры
    function initGame() {
        // Очистка игрового поля и сброс счёта
        hexGrid.innerHTML = '';
        gameBoard = [];
        playerCells = [];
        score = 0;
        gameOver = false;
        scoreElement.textContent = score;
        selectedItem = null;
        
        // Удаление выделения выбранного предмета
        itemElements.forEach(item => item.classList.remove('selected'));

        // Создание шестиугольной сетки
        for (let row = 0; row < GRID_SIZE; row++) {
            const rowArray = [];
            const rowElement = document.createElement('div');
            rowElement.className = 'hexagon-row';
            
            for (let col = 0; col < GRID_SIZE; col++) {
                const hex = document.createElement('div');
                hex.className = 'hexagon';
                hex.dataset.row = row;
                hex.dataset.col = col;
                
                // Дополнительный атрибут для отслеживания состояния
                hex.dataset.item = '';
                
                // Обработчик нажатия на шестиугольник
                hex.addEventListener('click', () => handleHexClick(row, col, hex));
                
                rowElement.appendChild(hex);
                rowArray.push(null); // Клетка пустая изначально
            }
            
            hexGrid.appendChild(rowElement);
            gameBoard.push(rowArray);
        }

        // Компьютер делает первый ход только если игра началась
        if (gameStarted) {
            computerTurn();
        }
    }

    function selectItem(item) {
        selectedItem = item;
        
        // Визуальное выделение выбранного предмета
        itemElements.forEach(el => {
            if (el.dataset.item === item) {
                el.classList.add('selected');
            } else {
                el.classList.remove('selected');
            }
        });
        
        gameStatus.textContent = `Выбран ${getItemName(item)}. Выберите клетку для размещения.`;
    }

    function handleHexClick(row, col, hexElement) {
        // Если игра окончена или предмет не выбран или клетка занята
        if (gameOver || !selectedItem) {
            return;
        }
        
        // Проверка, действительно ли клетка занята, с выводом отладочной информации
        if (gameBoard[row][col] !== null) {
            console.log(`Клетка [${row}][${col}] занята предметом: ${gameBoard[row][col]}`);
            return;
        }
        
        // Отмечаем, что пользователь взаимодействовал с игрой
        userInteracted = true;

        // Размещение предмета игрока
        placeItem(row, col, selectedItem, true); // true указывает, что это ход игрока
        
        // Проверка и очистка поля после хода игрока
        const clearedCells = checkAndClearBoard();
        
        // Начисление очков за очищенные клетки
        if (clearedCells > 0) {
            score += clearedCells;
            scoreElement.textContent = score;
            // Звук уже воспроизведен в checkAndClearBoard
        }
        
        // Проверка на заполненность поля
        if (isBoardFull()) {
            endGame();
            return;
        }
        
        // Ход компьютера
        computerTurn();
        
        // Очистка выбора предмета
        selectedItem = null;
        itemElements.forEach(item => item.classList.remove('selected'));
        gameStatus.textContent = 'Выберите предмет и разместите его на поле';
    }

    function placeItem(row, col, item, isPlayer = false) {
        // Проверяем, является ли клетка свободной
        if (gameBoard[row][col] !== null) {
            console.log(`Ошибка: клетка [${row}][${col}] уже занята предметом ${gameBoard[row][col]}`);
            return false;
        }
        
        // Обновление игрового массива
        gameBoard[row][col] = item;
        
        // Если это ход игрока, добавляем клетку в массив клеток игрока
        if (isPlayer) {
            playerCells.push({ row, col, item });
        }
        
        // Обновление отображения
        const hexElement = document.querySelector(`.hexagon[data-row="${row}"][data-col="${col}"]`);
        
        if (!hexElement) {
            console.log(`Ошибка: не найден элемент для клетки [${row}][${col}]`);
            // Восстанавливаем состояние
            gameBoard[row][col] = null;
            return false;
        }
        
        const img = document.createElement('img');
        img.src = `${item}.png`;
        img.alt = getItemName(item);
        
        // Добавляем класс для элементов игрока
        if (isPlayer) {
            img.classList.add('player-item');
        }
        
        hexElement.innerHTML = '';
        hexElement.appendChild(img);
        hexElement.classList.add('pop-in');
        
        // Добавляем атрибут для отслеживания состояния клетки
        hexElement.dataset.item = item;
        
        // Воспроизведение звука размещения
        playSound(buttonClickSound);
        
        return true;
    }

    function computerTurn() {
        // Определяем количество предметов, которые размещает компьютер в зависимости от очков игрока
        let itemsToPlace = 3; // Базовое количество
        let difficultyText = "Легкая (3 предмета)";
        
        if (score >= 60) {
            itemsToPlace = 6;
            difficultyText = "Очень сложная (6 предметов)";
        } else if (score >= 40) {
            itemsToPlace = 5;
            difficultyText = "Сложная (5 предметов)";
        } else if (score >= 20) {
            itemsToPlace = 4;
            difficultyText = "Средняя (4 предмета)";
        }
        
        // Обновляем отображение сложности
        difficultyElement.textContent = difficultyText;
        
        // Обновляем статус, чтобы показать игроку, сколько предметов разместит компьютер
        gameStatus.textContent = `Компьютер размещает ${itemsToPlace} предмета...`;
        
        // Счетчик успешно размещенных предметов
        let itemsPlaced = 0;
        let maxAttempts = itemsToPlace * 3; // Максимальное количество попыток
        let attempts = 0;
        
        // Компьютер делает ходы в зависимости от уровня сложности
        while (itemsPlaced < itemsToPlace && attempts < maxAttempts) {
            attempts++;
            
            // Проверка, есть ли свободные клетки
            if (isBoardFull()) {
                endGame();
                return;
            }
            
            // Случайный выбор предмета
            const randomItem = ITEMS[Math.floor(Math.random() * ITEMS.length)];
            
            // Выбор случайной свободной клетки
            const emptyCells = getEmptyCells();
            if (emptyCells.length === 0) {
                endGame();
                return;
            }
            
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            
            // Размещение предмета компьютера
            const success = placeItem(randomCell.row, randomCell.col, randomItem, false); // false указывает, что это ход компьютера
            
            if (success) {
                itemsPlaced++;
            }
        }
        
        // Проверка и очистка поля после хода компьютера
        const clearedCells = checkAndClearBoard();
        
        // Начисление очков за очищенные клетки (звук уже воспроизведен в checkAndClearBoard)
        if (clearedCells > 0) {
            score += clearedCells;
            scoreElement.textContent = score;
            
            // Обновляем сложность после начисления очков
            updateDifficulty();
        }
        
        // Проверка на заполненность поля
        if (isBoardFull()) {
            endGame();
        } else {
            gameStatus.textContent = 'Выберите предмет и разместите его на поле';
        }
    }

    function getEmptyCells() {
        const emptyCells = [];
        
        // Проверяем оба способа определения пустых клеток
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                // Проверка в массиве gameBoard
                const isBoardEmpty = gameBoard[row][col] === null;
                
                // Проверка DOM-элемента
                const hexElement = document.querySelector(`.hexagon[data-row="${row}"][data-col="${col}"]`);
                const isDomEmpty = hexElement && (hexElement.dataset.item === '' || !hexElement.dataset.item) && !hexElement.querySelector('img');
                
                // Если несоответствие, синхронизируем
                if (isBoardEmpty !== isDomEmpty) {
                    console.log(`Несоответствие в клетке [${row}][${col}]: gameBoard=${isBoardEmpty}, DOM=${isDomEmpty}`);
                    
                    // Исправляем состояние
                    if (isDomEmpty && !isBoardEmpty) {
                        gameBoard[row][col] = null;
                    }
                }
                
                // Клетка пуста, если оба условия истинны или если gameBoard пуст
                if (isBoardEmpty) {
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
        // Получение соседних клеток с учетом шестиугольной структуры
        // Для шестиугольной сетки соседи будут отличаться в зависимости от чётности строки
        const isEvenRow = row % 2 === 0;
        
        // Базовые соседи (6 направлений для шестиугольника)
        let neighbors = [
            { row: row - 1, col: isEvenRow ? col - 1 : col }, // Верхняя левая
            { row: row - 1, col: isEvenRow ? col : col + 1 }, // Верхняя правая
            { row: row, col: col - 1 },                       // Левая
            { row: row, col: col + 1 },                       // Правая
            { row: row + 1, col: isEvenRow ? col - 1 : col }, // Нижняя левая
            { row: row + 1, col: isEvenRow ? col : col + 1 }  // Нижняя правая
        ];
        
        // Фильтрация соседей, находящихся за пределами сетки
        return neighbors.filter(n => 
            n.row >= 0 && n.row < GRID_SIZE && 
            n.col >= 0 && n.col < GRID_SIZE
        );
    }

    function checkAndClearBoard() {
        // Массив клеток, которые нужно очистить
        const cellsToClear = [];
        
        // Проверяем только клетки, размещенные игроком
        for (const playerCell of playerCells) {
            const row = playerCell.row;
            const col = playerCell.col;
            const currentItem = gameBoard[row][col];
            
            // Если клетка пуста (уже была удалена), пропускаем её
            if (!currentItem) continue;
            
            const neighbors = getNeighbors(row, col);
            let hasWinner = false;
            let hasLoser = false;
            
            // Проверяем соседей по правилам игры
            for (const neighbor of neighbors) {
                const neighborItem = gameBoard[neighbor.row][neighbor.col];
                if (!neighborItem) continue; // Пропуск пустых соседних клеток
                
                // Проверка правил (камень бьет ножницы, ножницы бьют бумагу, бумага бьет камень)
                if (currentItem === 'stone' && neighborItem === 'scissors') {
                    hasWinner = true;
                } else if (currentItem === 'scissors' && neighborItem === 'paper') {
                    hasWinner = true;
                } else if (currentItem === 'paper' && neighborItem === 'stone') {
                    hasWinner = true;
                }
                
                // Проверка наличия бьющего соседа
                if (currentItem === 'stone' && neighborItem === 'paper') {
                    hasLoser = true;
                } else if (currentItem === 'scissors' && neighborItem === 'stone') {
                    hasLoser = true;
                } else if (currentItem === 'paper' && neighborItem === 'scissors') {
                    hasLoser = true;
                }
            }
            
            // Если есть побеждающий сосед и нет проигрышного, помечаем для удаления
            if (hasWinner && !hasLoser) {
                // Отмечаем проигрывающих соседей для удаления
                for (const neighbor of neighbors) {
                    const neighborItem = gameBoard[neighbor.row][neighbor.col];
                    if (!neighborItem) continue;
                    
                    if ((currentItem === 'stone' && neighborItem === 'scissors') ||
                        (currentItem === 'scissors' && neighborItem === 'paper') ||
                        (currentItem === 'paper' && neighborItem === 'stone')) {
                        cellsToClear.push(neighbor);
                    }
                }
            }
        }
        
        // Очистка помеченных клеток
        const uniqueCellsToClear = [...new Map(cellsToClear.map(cell => 
            [`${cell.row}-${cell.col}`, cell])).values()];
        
        for (const cell of uniqueCellsToClear) {
            clearCell(cell.row, cell.col);
        }
        
        // Если есть очищенные клетки, воспроизводим звук победы
        if (uniqueCellsToClear.length > 0) {
            playSound(victorySound);
        }
        
        return uniqueCellsToClear.length; // Возвращаем количество очищенных клеток
    }

    function clearCell(row, col) {
        // Обновление игрового массива
        gameBoard[row][col] = null;
        
        // Удаление клетки из массива клеток игрока, если она принадлежала игроку
        playerCells = playerCells.filter(cell => !(cell.row === row && cell.col === col));
        
        // Обновление отображения
        const hexElement = document.querySelector(`.hexagon[data-row="${row}"][data-col="${col}"]`);
        
        if (!hexElement) {
            console.log(`Ошибка: не найден элемент для очистки клетки [${row}][${col}]`);
            return;
        }
        
        hexElement.classList.add('removed');
        
        // Сбрасываем атрибут item
        hexElement.dataset.item = '';
        
        // Удаление содержимого после анимации
        setTimeout(() => {
            hexElement.innerHTML = '';
            hexElement.classList.remove('removed');
        }, 500);
    }

    function endGame() {
        gameOver = true;
        finalScore.textContent = score;
        endGameMessage.style.display = 'flex';
    }

    function getItemName(item) {
        switch (item) {
            case 'stone': return 'Камень';
            case 'scissors': return 'Ножницы';
            case 'paper': return 'Бумага';
            default: return '';
        }
    }

    // Функция обновления сложности
    function updateDifficulty() {
        let difficultyText = "Легкая (3 предмета)";
        
        if (score >= 60) {
            difficultyText = "Очень сложная (6 предметов)";
        } else if (score >= 40) {
            difficultyText = "Сложная (5 предметов)";
        } else if (score >= 20) {
            difficultyText = "Средняя (4 предмета)";
        }
        
        // Обновляем отображение сложности
        difficultyElement.textContent = difficultyText;
    }
}); 