require=(function e(t,n,r){
  function s(o,u){if(!n[o]){if(!t[o]){
    var a=typeof require=="function"&&require;
    if(!u&&a)return a(o,!0);
    if(i)return i(o,!0);
    var f=new Error("Cannot find module '"+o+"'");
    throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};
  t[o][0].call(l.exports,function(e){
    var n=t[o][1][e];
    return s(n?n:e)},l,l.exports,e,t,n,r)}
    return n[o].exports
  }
  var i=typeof require=="function"&&require;
  for(var o=0;o<r.length;o++)s(r[o]);return s})
    ({"/client/gameBoard.js":[function(require,module,exports){

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
        }//end fucnt

        function renderBoard(gameState) {
            var colWidth = myCanvas.width / NUM_COLS_ON_BOARD;
            var rowHeight = myCanvas.height / NUM_ROWS_ON_BOARD;
            for (var rowIndex = 0; rowIndex <= MAX_ROW_INDEX; rowIndex++) {
                for (var colIndex = 0; colIndex <= MAX_COL_INDEX; colIndex++) {
                    var slotStatus = gameState[rowIndex][colIndex];
                    var topLeftX = colIndex * colWidth;
                    var topLeftY = rowIndex * rowHeight;
                    canvas.fillStyle = colour[slotStatus];
                    canvas.fillRect(topLeftX, topLeftY, colWidth, rowHeight);
                    canvas.strokeRect(topLeftX, topLeftY, colWidth, rowHeight);
                    canvas.strokStyle = colour['black'];
                }//end inner for
            }//end outer for
        }//end funct

        module.exports = {
            createGameBoard  : createGameBoard,
            renderBoard      : renderBoard,
            NUM_ROWS_ON_BOARD: NUM_ROWS_ON_BOARD,
            NUM_COLS_ON_BOARD: NUM_COLS_ON_BOARD,
            MAX_ROW_INDEX    : MAX_ROW_INDEX,
            MAX_COL__INDEX   : MAX_COL_INDEX
        }
    },{}],1:[function(require,module,exports){

        window.addEventListener('DOMContentLoaded', function () {
            var socket = io('/');
            var gameBoard = require('./gameBoard.js');
            var gameJoined, playerColor, currentTurnColor;
            var gameState = gameBoard.createGameBoard();
            bindUiListeners();
            bindSocketListeners();
            socket.emit('getListOfOpenGames');

            function createNewGame() {
                var newGameName = document.getElementById('new_game_name').value;
                if (newGameName) {
                    socket.emit('createNewGame', newGameName);
                } else {
                    window.alert('Choose name for game room');
                }//end else if
            }//end funct

            function joinSelectedGame() {
                var gameToJoin = document.getElementById('open_games_list').value;
                if (gameToJoin) {
                    socket.emit('addPlayerToGame', gameToJoin);
                } else {
                    window.alert('Choose game from list');
                }//end else if
            }//end funct

            function makeMove (clickEvent) {
                if (playerColor && (playerColor === currentTurnColor)) {
                    var columnWidthInPixels = document.getElementById('gameBoard').width / gameBoard.NUM_COLS_ON_BOARD;
                    var columnIndex = Math.floor(clickEvent.clientX/ columnWidthInPixels);
                    for (var row = gameBoard.MAX_ROW_INDEX; row >= 0; row--) {
                        if (gameState[row][columnIndex] === 'blank') {
                            gameState[row][columnIndex] = playerColor;
                            gameBoard.renderBoard(gameState);
                            socket.emit('playerMove', {currentTurnColor: currentTurnColor, gameState: gameState});
                            return;
                        }//end if
                    }//end for
                    window.alert('Invalid move');
                } else {
                    window.alert('Other players turn');
                }//end else if
            }//end funct

            //UI listeners
            function bindUiListeners() {
                document.getElementById('add_game').addEventListener('click', createNewGame);
                document.getElementById('join_selected_game').addEventListener('click', joinSelectedGame);
                document.getElementById('gameBoard').addEventListener('click', makeMove);
            }

            //update UI for added players
            function updateUiForAddedPlayer (playerInfoObject) {
                gameJoined = playerInfoObject.gameName;
                playerColor = playerInfoObject.playerColor;
                window.alert('You joined: ' + gameJoined + ' Colour: ' + playerColor + '.');
                var colorText = 'Your Color: <input type="text" disabled value="' + playerColor + '">';
                document.getElementById('player_color_placeholder').innerHTML = colorText;
            }//end funct

            //update UI when players = 2
            function updateUiForGameStarted(initGameObject) {
                currentTurnColor = initGameObject.currentTurnColor;
                window.alert('Game Start. ' + currentTurnColor + ' plays first.');
                var currentTurnHtml = 'Current Turn Color: <input type="text" disabled value="' + currentTurnColor + '">';
                document.getElementById('current_turn_color_placeholder').innerHTML = currentTurnHtml;
            }//end funct

            //update UI when player makes a move
            function updateUiForGameStateUpdate(gameInfo) {
                gameState = gameInfo.gameState;
                currentTurnColor = gameInfo.currentTurnColor;
                gameBoard.renderBoard(gameState);
                var currentTurnHtml = 'Current Turn Color: <input type="text" disabled value="' + currentTurnColor + '">';
                document.getElementById('current_turn_color_placeholder').innerHTML = currentTurnHtml;
            }//end funct

            //display game rooms
            function displayListOfGames(gamesListObject) {
                var gamesListArray = gamesListObject.openGameNames;
                var gamesListMenu = '<select id="open_games_list"><option value="">Choose game</option>';
                for (var gameName = 0; gameName < gamesListArray.length; gameName++) {
                    gamesListMenu += '<option value ="' + gamesListArray[gameName] + '">' + gamesListArray[gameName] + '</option>';
                }
                gamesListMenu += '</select>';
                document.getElementById('game_name_placeholder').innerHTML = gamesListMenu;
            }//end funct

            //bind listeners
            function bindSocketListeners() {
                socket.on('displayListOfGames', displayListOfGames);
                //game created
                socket.on('gameCreated', function(gamesListObject) {
                    window.alert('Game created, choose from list to join');
                });

                //failed to create game
                socket.on('failedToCreateGame', function() {
                    window.alert('Names need to be unique');
                });

                //failed to add player
                socket.on('failedToAddPlayer', function() {
                    window.alert('Game full');
                })

                socket.on('playerAddedToGame', updateUiForAddedPlayer);
                socket.on('gameStarted', updateUiForGameStarted);
                socket.on('gameStateUpdate', updateUiForGameStateUpdate);

                //game over
                socket.on('gameOver', function() {
                    window.alert('Game over');
                });
            }//end funct
        });
    },{"./gameBoard.js":"/client/gameBoard.js"}]},{},[1]);
