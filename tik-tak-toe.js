let board = ['', '', '', '', '', '', '', '', ''];
let gameOver = false;
const cross = 'x';
const circle = '0';
const crossImg = './pics/cross1.png';
const circleImg = './pics/circle.png';
const cells = document.querySelectorAll('.color');
const messageElement = document.getElementById('message');
const restartBtn = document.getElementById('restart-btn');
const winningCombis = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
];
//test
/**
 * shows message depending on who wins the game
 * @param text
 */
function showMessage(text) {
    messageElement.textContent = text;
    messageElement.classList.add('show');
}

/**
 * clears the winning message
 */
function clearMessage() {
    messageElement.classList.remove('show');
    messageElement.textContent = '';
}

/**
 * ends game
 */
function endGame() {
    gameOver = true;
}

/**
 * goes through every cell and returns indexes of empty cells
 * @param board
 * @returns {*}
 */
function findEmptyCells(board) {
    return board
        .map((value, index) => value === '' ? index : null)
        .filter(index => index !== null);
}

/**
 *places cross
 * @param board
 * @param index
 * @returns {*|*[]}
 */
function placeCross(board, index) {
    if (board[index] !== '') return board;
    const newBoard = [...board];
    newBoard[index] = cross;
    return newBoard;
}

/**
 *
 * @param board
 * @param player
 * @returns {null|any}
 */
function findWinningMove(board, player) {
    const emptyCells = findEmptyCells(board);
    for (const index of emptyCells) {
        const newBoard = [...board];
        newBoard[index] = player;

        if (checkWin(newBoard, player)) {
            return index;
        }
    }
    return null;
}

/**
 * places circle on the board
 * @param board
 * @returns {*|*[]}
 */
function placeRandomCircle(board) {
    const emptyCells = findEmptyCells(board);
    if (emptyCells.length === 0) return board;

    const winIndex = findWinningMove(board, circle);
    if (winIndex !== null) {
        const newBoard = [...board];
        newBoard[winIndex] = circle;
        return newBoard;
    }

    const blockIndex = findWinningMove(board, cross);
    if (blockIndex !== null) {
        const newBoard = [...board];
        newBoard[blockIndex] = circle;
        return newBoard;
    }

    const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newBoard = [...board];
    newBoard[randomIndex] = circle;
    return newBoard;
}

/**
 * checks if someone won
 * @param board
 * @param player
 * @returns {boolean}
 */
function checkWin(board, player) {
    return winningCombis.some(combo =>
        combo.every(i => board[i] === player)
    );
}

/**
 * checks if nobody won
 * @param board
 * @returns {*}
 */
function checkDraw(board) {
    return board.every(cell => cell !== '');
}

/**
 * Evaluates the current game state of the board
 * @param board
 * @returns {null|string}
 */
function evaluateGame(board) {
    if (checkWin(board, cross)) return 'player';
    if (checkWin(board, circle)) return 'computer';
    if (checkDraw(board)) return 'draw';
    return null;
}

/**
 *finishes the game by displaying the message
 * @param result
 */
function finishGame(result) {
    document.body.classList.remove('win', 'lose', 'draw');

    if (result === 'player') {
        showMessage('You won!');
        document.body.classList.add('win');
    } else if (result === 'computer') {
        showMessage('Computer won!');
        document.body.classList.add('lose');
    } else {
        showMessage('Draw!');
        document.body.classList.add('draw');
    }
    endGame();
}

/**
 * renders board on the website and uses images for circle/cross
 * @param board
 */
function renderBoard(board) {
    cells.forEach((cell, index) => {
        cell.innerHTML = '';

        if (board[index] === cross) {
            const img = document.createElement('img');
            img.src = crossImg;
            img.style.width = '80%';
            img.style.height = '80%';
            cell.appendChild(img);
        }

        if (board[index] === circle) {
            const img = document.createElement('img');
            img.src = circleImg;
            img.style.width = '80%';
            img.style.height = '80%';
            cell.appendChild(img);
        }
    });
}

/**
 * Handles a click on a game board cell by the player
 * @param event
 */
function handleCellClick(event) {
    if (gameOver) return;

    const index = (event.target.dataset.index);
    if (board[index] !== '') return;

    const newBoard = placeCross(board, index);
    board.splice(0, board.length, ...newBoard);

    renderBoard(board);

    let result = evaluateGame(board);
    if (result) return finishGame(result);

    showMessage('Computer is thinking...');

    setTimeout(() => {
        if (gameOver) return;

        const circleBoard = placeRandomCircle(board);
        board.splice(0, board.length, ...circleBoard);

        renderBoard(board);

        result = evaluateGame(board);
        if (result) finishGame(result);
        else clearMessage();
    }, 500);
}

/**
 * Resets the game to its initial state
 */
function restartGame() {
    board.fill('');
    gameOver = false;

    renderBoard(board);
    clearMessage();
    document.body.classList.remove('win', 'lose', 'draw');
}

/**
 * Initializes the Tic-Tac-Toe game by attaching event listeners
 */
function init() {
    cells.forEach(cell =>
        cell.addEventListener('click', handleCellClick)
    );
    restartBtn.addEventListener('click', restartGame);
}

if (document.querySelectorAll('.color').length > 0) {
    init();
}

module.exports = {
    board,
    cross,
    circle,
    findEmptyCells,
    placeCross,
    findWinningMove,
    placeRandomCircle,
    checkWin,
    checkDraw,
    evaluateGame,
    showMessage,
    clearMessage,
    renderBoard,
    restartGame,
    handleCellClick,
    finishGame
};