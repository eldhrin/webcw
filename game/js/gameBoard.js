//maps colours
var colour = {
    'blank': '#fff',
    'red'  : '#f00',
    'blue' : '#00f'
}

var NUM_COLS_ON_BOARD = 7;
var NUM_ROWS_ON_BOARD = 6;
var MAX_COL_INDEX = 6;
var MAX_ROW_INDEX = 5;
var myCanvas = document.getElementById('gameBoard');
var canvas = myCanvas.getContext('2d');

function createGameBoard () {
    var gameState = [];
    for (var rowIndex = 0; rowIndex <= MAX_ROW_INDEX; rowIndex++) {
        gameState.push([]);
        for (var colIndex = 0; colIndex <= MAX_COL_INDEX; colIndex++) {
            gameState[rowIndex].push('blank');
        }//end inner for
    }//end outer for
    renderBoard(gameState);
    return gameState;
}//end funct

//draws the board using canvas
function renderBoard(state) {
    var colWidth = myCanvas.width / NUM_COLS_ON_BOARD;
    var rowHeight = myCanvas.height / NUM_ROWS_ON_BOARD;
    for (var rowIndex = 0; rowIndex <= MAX_ROW_INDEX; rowIndex++) {
        for (var colIndex = 0; colIndex <= MAX_COL_INDEX; colIndex++) {
            var slotStatus = state[rowIndex][colIndex];
            var topLeftX = colIndex * colWidth;
            var topLeftY = rowIndex * rowHeight;
            canvas.fillStyle = colour[slotStatus];
            canvas.fillRect(topLeftX, topLeftY, colWidth, rowHeight);
            canvas.strokeRect(topLeftX, topLeftY, colWidth, rowHeight);
            canvas.strokStyle = colour['black'];
        }//end inner for
    }//end outer for
}//end fucnt

//exports
module.exports = {
    createGameBoard  : createGameBoard,
    renderBoard      : renderBoard,
    NUM_ROWS_ON_BOARD: NUM_ROWS_ON_BOARD,
    NUM_COLS_ON_BOARD: NUM_COLS_ON_BOARD,
    MAX_ROW_INDEX    : MAX_ROW_INDEX,
    MAX_COL__INDEX   : MAX_COL_INDEX
}