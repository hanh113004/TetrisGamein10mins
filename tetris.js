// Constants
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 30;

// Add this constant for piece colors
const COLORS = [
    '#FF0D72', // I
    '#0DC2FF', // O
    '#0DFF72', // T
    '#F538FF', // L
    '#FF8E0D', // J
    '#FFE138', // S
    '#3877FF'  // Z
];

// Tetromino shapes
const SHAPES = [
    { shape: [[1, 1, 1, 1]], colorIndex: 0 },  // I
    { shape: [[1, 1], [1, 1]], colorIndex: 1 },  // O
    { shape: [[1, 1, 1], [0, 1, 0]], colorIndex: 2 },  // T
    { shape: [[1, 1, 1], [1, 0, 0]], colorIndex: 3 },  // L
    { shape: [[1, 1, 1], [0, 0, 1]], colorIndex: 4 },  // J
    { shape: [[1, 1, 0], [0, 1, 1]], colorIndex: 5 },  // S
    { shape: [[0, 1, 1], [1, 1, 0]], colorIndex: 6 }   // Z
];

// Game variables
let board = [];
let currentPiece;
let currentX;
let currentY;
let score = 0;
let gameInterval;
let isPaused = false;
let nextPiece;

// Initialize the game
function init() {
    document.getElementById('start-button').addEventListener('click', startGame);
    document.getElementById('pause-button').addEventListener('click', togglePause);
    document.addEventListener('keydown', handleKeyPress);

    // Set up the next-piece display
    const nextPieceElement = document.getElementById('next-piece');
    nextPieceElement.style.position = 'relative';
    nextPieceElement.style.width = (4 * BLOCK_SIZE) + 'px';
    nextPieceElement.style.height = (4 * BLOCK_SIZE) + 'px';
}

function startGame() {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';

    // Reset game state
    board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
    score = 0;
    updateScore();
    
    // Create new piece and next piece
    nextPiece = getRandomPiece();
    newPiece();
    
    // Start the game loop
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, 1000);

    // Focus on the game board for immediate keyboard input
    document.getElementById('game-board').focus();

    // Initial draw
    drawBoard();
}

function togglePause() {
    isPaused = !isPaused;
    if (isPaused) {
        clearInterval(gameInterval);
        document.getElementById('pause-button').textContent = 'Resume';
    } else {
        gameInterval = setInterval(gameLoop, 1000);
        document.getElementById('pause-button').textContent = 'Pause';
    }
}

function gameLoop() {
    if (isPaused) return;

    if (canMove(0, 1)) {
        currentY++;
    } else {
        freezePiece();
        clearLines();
        if (!newPiece()) {
            // Game over
            clearInterval(gameInterval);
            alert('Game Over! Your score: ' + score);
            showStartScreen();
            return;
        }
    }
    drawBoard();
}

function showStartScreen() {
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('start-screen').style.display = 'block';
}

function newPiece() {
    currentPiece = nextPiece;
    nextPiece = getRandomPiece();
    currentX = Math.floor(BOARD_WIDTH / 2) - Math.ceil(currentPiece.shape[0].length / 2);
    currentY = 0;

    if (!canMove(0, 0)) {
        return false;
    }
    drawNextPiece();
    return true;
}

function freezePiece() {
    for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
            if (currentPiece.shape[y][x]) {
                board[currentY + y][currentX + x] = currentPiece.colorIndex + 1;
            }
        }
    }
}

function clearLines() {
    let linesCleared = 0;
    let linesToClear = [];

    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
        if (board[y].every(cell => cell !== 0)) {
            linesToClear.push(y);
            linesCleared++;
        }
    }
    
    if (linesCleared > 0) {
        // Flash effect
        flashLines(linesToClear, () => {
            // After flash effect, remove lines
            for (let y of linesToClear.sort((a, b) => b - a)) {
                board.splice(y, 1);
                board.unshift(new Array(BOARD_WIDTH).fill(0));
            }
            
            // Update score based on number of lines cleared
            score += calculateScore(linesCleared);
            updateScore();
            drawBoard();
        });
    }
}

function flashLines(lines, callback) {
    let flashes = 0;
    const maxFlashes = 3;
    const flashInterval = setInterval(() => {
        const gameBoard = document.getElementById('game-board');
        for (let y of lines) {
            for (let x = 0; x < BOARD_WIDTH; x++) {
                const blockIndex = y * BOARD_WIDTH + x;
                if (blockIndex < gameBoard.children.length) {
                    const block = gameBoard.children[blockIndex];
                    block.style.backgroundColor = flashes % 2 === 0 ? 'white' : COLORS[board[y][x] - 1];
                }
            }
        }
        flashes++;
        if (flashes >= maxFlashes * 2) {
            clearInterval(flashInterval);
            callback();
        }
    }, 100);
}

function calculateScore(linesCleared) {
    const basePoints = 100;
    const multipliers = [0, 1, 3, 5, 8]; // 0, 1, 2, 3, 4+ lines
    return basePoints * multipliers[Math.min(linesCleared, 4)];
}

function canMove(offsetX, offsetY, piece = currentPiece.shape) {
    for (let y = 0; y < piece.length; y++) {
        for (let x = 0; x < piece[y].length; x++) {
            if (piece[y][x]) {
                const newX = currentX + x + offsetX;
                const newY = currentY + y + offsetY;
                if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT || (newY >= 0 && board[newY][newX])) {
                    return false;
                }
            }
        }
    }
    return true;
}

function drawBoard() {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            const block = document.createElement('div');
            block.style.position = 'absolute';
            block.style.width = BLOCK_SIZE + 'px';
            block.style.height = BLOCK_SIZE + 'px';
            block.style.left = x * BLOCK_SIZE + 'px';
            block.style.top = y * BLOCK_SIZE + 'px';
            block.style.backgroundColor = board[y][x] ? COLORS[board[y][x] - 1] : 'black';
            gameBoard.appendChild(block);
        }
    }

    // Draw current piece
    for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
            if (currentPiece.shape[y][x]) {
                const block = document.createElement('div');
                block.style.position = 'absolute';
                block.style.width = BLOCK_SIZE + 'px';
                block.style.height = BLOCK_SIZE + 'px';
                block.style.left = (currentX + x) * BLOCK_SIZE + 'px';
                block.style.top = (currentY + y) * BLOCK_SIZE + 'px';
                block.style.backgroundColor = COLORS[currentPiece.colorIndex];
                gameBoard.appendChild(block);
            }
        }
    }
}

function handleKeyPress(event) {
    if (isPaused) return;

    switch (event.keyCode) {
        case 37: // Left arrow
            if (canMove(-1, 0)) currentX--;
            break;
        case 39: // Right arrow
            if (canMove(1, 0)) currentX++;
            break;
        case 40: // Down arrow
            if (canMove(0, 1)) currentY++;
            break;
        case 38: // Up arrow (rotate)
            rotate();
            break;
        case 80: // 'P' key for pause
            togglePause();
            break;
    }
    drawBoard();
}

function rotate() {
    const rotated = currentPiece.shape[0].map((_, index) =>
        currentPiece.shape.map(row => row[index]).reverse()
    );
    
    // Check if rotation is possible
    const kickOffsets = [
        [0, 0], [-1, 0], [1, 0], [0, -1], [-1, -1], [1, -1]
    ];
    
    for (let [offsetX, offsetY] of kickOffsets) {
        if (canMove(offsetX, offsetY, rotated)) {
            currentPiece.shape = rotated;
            currentX += offsetX;
            currentY += offsetY;
            return true;
        }
    }
    
    return false; // Rotation not possible
}

function updateScore() {
    document.getElementById('score').textContent = score;
}

// Add this new function to get a random piece
function getRandomPiece() {
    return SHAPES[Math.floor(Math.random() * SHAPES.length)];
}

// Add this new function to draw the next piece
function drawNextPiece() {
    const nextPieceElement = document.getElementById('next-piece');
    nextPieceElement.innerHTML = '';
    for (let y = 0; y < nextPiece.shape.length; y++) {
        for (let x = 0; x < nextPiece.shape[y].length; x++) {
            if (nextPiece.shape[y][x]) {
                const block = document.createElement('div');
                block.style.position = 'absolute';
                block.style.width = BLOCK_SIZE + 'px';
                block.style.height = BLOCK_SIZE + 'px';
                block.style.left = (x * BLOCK_SIZE) + 'px';
                block.style.top = (y * BLOCK_SIZE) + 'px';
                block.style.backgroundColor = COLORS[nextPiece.colorIndex];
                nextPieceElement.appendChild(block);
            }
        }
    }
}

// Initialize the game when the page loads
window.addEventListener('load', init);