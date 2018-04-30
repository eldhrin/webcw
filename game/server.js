//INITIAL VARIABLES
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var mongoose = require('mongoose');
var games = {};
var MAX_NUM_PLAYERS = 2;
var jwt = require('jsonwebtoken');
var superSecret = 'secret';
var config = require('./config');
var apiRouter = express.Router();

apiRouter.get('/', function(req,res){
    res.sendFile(__dirname + '/index.html');
});

apiRouter.get('/login', function(req,res){
    res.sendFile(__dirname + '/login.html');
});


//START SERVER
//accessed at port 80
server.listen(config.port);
console.log('Game is on port 80, access at localhost:80/');
app.use(express.static(__dirname));
io.on('connection', initPlayerSocket);


function initPlayerSocket(socket) {

  //get list of created games
    function getListOfOpenGames() {
        socket.emit('displayListOfGames', {openGameNames: getOpenGamesArray()})
    }

    //get created games as an array
    function getOpenGamesArray() {
        var openGameNames = [];
        for (var gameName in games) {
            if (games.hasOwnProperty(gameName) && games[gameName].players.length < MAX_NUM_PLAYERS) {
                openGameNames.push(gameName);
            }
        }
        return openGameNames;
    }

    //create new game with given name
    function createNewGame (name) {
      //if game has a unique name
        if (!games.hasOwnProperty(name)) {
            games[name] = {players: [], currentTurnColor: 'blue'};
            io.emit('displayListOfGames', {openGameNames: getOpenGamesArray()});
            socket.emit('gameCreated')
            console.log('Game created: ' + name);
        } else {
          //failed to create game
            socket.emit('failedToCreateGame');
        }//end else if
    }//end funct

    //add player to game
    function addPlayerToGame (name) {
      //if players <2 , wait for player
        if (games[name] && (games[name].players.length < MAX_NUM_PLAYERS)) {
            socket.gameName = name;
            games[name].players.push(socket);
            var playerIndex = games[name].players.indexOf(socket);
            var playerColor = (playerIndex === 0) ? 'blue' : 'red';
            socket.playerColor = playerColor;
            socket.emit('playerAddedToGame', {playerColor: playerColor, gameName: name});
            //if players = 2 then start game and update UI
            if (games[name].players.length === MAX_NUM_PLAYERS) {
                for (var i = 0; i < games[name].players.length; i++) {
                    games[name].players[i].emit('gameStarted', {currentTurnColor: games[name].currentTurnColor});
                }//end for
            }
        } else {
          //failed to add player, room full
            socket.emit('failedToAddPlayer');
        }//end if else
    }//end funct

    //player move
    function playerMove (info) {
        var newTurnColor = (games[socket.gameName].currentTurnColor === 'blue') ? 'red' : 'blue';
        games[socket.gameName].currentTurnColor = newTurnColor;
        for (var i = 0; i < games[socket.gameName].players.length; i++) {
            games[socket.gameName].players[i].emit(
                //updates state
                'gameStateUpdate',
                {currentTurnColor: newTurnColor, gameState: info.gameState}
            );
        }
        if (isGameOver(info.gameState)) {
            for (var i = 0; i < games[socket.gameName].players.length; i++) {
                games[socket.gameName].players[i].emit('gameOver');
            }//end for
        }//end if
    }//end funct

    socket.on('getListOfOpenGames', getListOfOpenGames);
    socket.on('createNewGame', createNewGame);
    socket.on('addPlayerToGame', addPlayerToGame);
    socket.on('playerMove', playerMove);
}

//check if game is over
function isGameOver(state) {
  //if no blank spaces left, game over
    if (state[0].indexOf('blank') < 0) {
        return true;
    }//end if
    //check the rows
    for (var row = 0; row <  state.length; row++) {
        var rowString = state[row].join();
        if (rowString.match(/red,red,red,red/) || rowString.match(/blue,blue,blue,blue/)) {
            return true;
        }//end if
    }//end for
    //check the columns
    for (var col = 0; col < state[0].length; col++) {
        var currentColumnArray = [];
        for (var row = 0; row < state.length; row++) {
            currentColumnArray.push(state[row][col]);
        }//end inner for
        var currentColumnString = currentColumnArray.join();
        if (currentColumnString.match(/red,red,red,red/) || currentColumnString.match(/blue,blue,blue,blue/)) {
            return true;
        }//end if
    }//end outer for
    //check diagonal
    for (var row = 0; row < state.length; row++) {
        for (var col = 0; col < state[row].length; col++) {
            if (state[row-3] && state[row-3][col+3]) {
                var diagRight = [state[row][col], state[row-1][col+1], state[row-2][col+2], state[row-3][col+3]];
                var diagRightString = diagRight.join();
                if (diagRightString.match(/red,red,red,red/) || diagRightString.match(/blue,blue,blue,blue/)) {
                    return true;
                }//end if
            }//end if
            if (state[row-3] && state[row-3][col-3]) {
                var diagLeft = [state[row][col], state[row-1][col-1], state[row-2][col-2], state[row-3][col-3]];
                var diagLeftString = diagLeft.join();
                if (diagLeftString.match(/red,red,red,red/) || diagLeftString.match(/blue,blue,blue,blue/)) {
                    return true;
                }//end inner if
            }//end if
        }//end outer for
    }//end outer for

    //return false if game is not over
    return false;
}//end