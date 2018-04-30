//listen for DOM loading
window.addEventListener('DOMContentLoaded', function () {
    var socket = io('/');
    //uses gameBoard js file
    var gameBoard = require('./gameBoard.js');
    var gameJoined, playerColor, currentTurnColor;
    //create game board
    var gameState = gameBoard.createGameBoard();

    //bind listeners for UI updating and sockets
    bindUiListeners();
    bindSocketListeners();
    socket.emit('getListOfOpenGames');

    //create a new game with user input variable
    function createNewGame() {
      //get name
        var newGameName = document.getElementById('new_game_name').value;
        if (newGameName) {
            socket.emit('createNewGame', newGameName);
        } else {
            window.alert('Choose a name');
        }//end if else
    }//end fucnt

    //join game from dropdown menu
    function joinSelectedGame() {
      //get game selected
        var gameToJoin = document.getElementById('open_games_list').value;
        if (gameToJoin) {
            socket.emit('addPlayerToGame', gameToJoin);
        } else {
            window.alert('Choose a game');
        }//end if else
    }//end funct

    //player makes move
    function makeMove (clickEvent) {
        if (playerColor && (playerColor === currentTurnColor)) {
            var columnWidthInPixels = document.getElementById('gameBoard').width / gameBoard.NUM_COLS_ON_BOARD;
            var columnIndex = Math.floor(clickEvent.clientX / columnWidthInPixels);

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
        }//end if else
    }//end fucnt

    //listen to when UI needs updated
    function bindUiListeners() {
        document.getElementById('add_game').addEventListener('click', createNewGame);
        document.getElementById('join_selected_game').addEventListener('click', joinSelectedGame);
        document.getElementById('gameBoard').addEventListener('click', makeMove);
    }//end funct

    //update when player is added
    function updateUiForAddedPlayer (playerInfoObject) {
        gameJoined = playerInfoObject.gameName;
        playerColor = playerInfoObject.playerColor;
        //window popup
        window.alert('You joined: ' + gameJoined + ', colour: ' + playerColor + '.');
        var colorText = 'Your Color: <input type="text" disabled value="' + playerColor + '">';
        document.getElementById('player_color_placeholder').innerHTML = colorText;
    }//end fucnt

    //update UI for when game starts
    function updateUiForGameStarted(initGameObject) {
        currentTurnColor = initGameObject.currentTurnColor;
        window.alert('Player has joined. ' + currentTurnColor + ' plays first.');
        var currentTurnHtml = 'Current Turn Color: <input type="text" disabled value="' + currentTurnColor + '">';
        document.getElementById('current_turn_color_placeholder').innerHTML = currentTurnHtml;
    }//end funct

    //updated UI when player makes a move
    function updateUiForGameStateUpdate(gameInfo) {
        gameState = gameInfo.gameState;
        currentTurnColor = gameInfo.currentTurnColor;
        gameBoard.renderBoard(gameState);
        var currentTurnHtml = 'Current Turn Color: <input type="text" disabled value="' + currentTurnColor + '">';
        document.getElementById('current_turn_color_placeholder').innerHTML = currentTurnHtml;
    }//end funct

    //show game rooms created on dropdown list
    function displayListOfGames(gamesListObject) {
        var gamesListArray = gamesListObject.openGameNames;
        var gamesListMenu = '<select id="open_games_list"><option value="">Choose game</option>';
        for (var gameName = 0; gameName < gamesListArray.length; gameName++) {
            gamesListMenu += '<option value ="' + gamesListArray[gameName] + '">' + gamesListArray[gameName] + '</option>';
        }//end for
        gamesListMenu += '</select>';
        document.getElementById('game_name_placeholder').innerHTML = gamesListMenu;
    }//end funct

    //bind the listeners
    function bindSocketListeners() {

        socket.on('displayListOfGames', displayListOfGames);
        //game created
        socket.on('gameCreated', function(gamesListObject) {
            window.alert('Game room created, choose from dropdown list to play');
        });
        //failed to create game
        socket.on('failedToCreateGame', function() {
            window.alert('Names must be unique');
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
});//end