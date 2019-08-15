const readline = require("readline");
const Piece = require("./piece.js");
const Board = require("./board.js");

/**
 * Sets up the game with a board and the first player to play a turn.
 */
function Game () {
  this.board = new Board();
  this.turn = "black";
};

/**
 * Flips the current turn to the opposite color.
 */
Game.prototype._flipTurn = function () {
  this.turn = (this.turn == "black") ? "white" : "black";
};

// Dreaded global state!
let rlInterface;

/**
 * Creates a readline interface and starts the run loop.
 */
Game.prototype.play = function () {
  rlInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  this.runLoop(function () {
    rlInterface.close();
    rlInterface = null;
  });
};

/**
 * Gets the next move from the current player and
 * attempts to make the play.
 */
Game.prototype.playTurn = function (callback) {
  this.board.print();
  if (this.turn === "black"){
    rlInterface.question(
      `${this.turn}, where do you want to move?`,
      handleResponse.bind(this)
    );
  }
  else {
    console.log("AI turn:");
    let aiMoves = this.board.validMoves("white");
    let highestCount = 0;
    let bestMove = [0,0];
    let possibleDirs = [
      [0, 1], [1, 1], [1, 0],
      [1, -1], [0, -1], [-1, -1],
      [-1, 0], [-1, 1]
    ];
    // console.log(possibleDirs);
    // let aiMove = aiMoves[Math.floor(Math.random()*aiMoves.length)];
    for (let i = 0; i < aiMoves.length; i++){
      //_positionsToFlip (board, pos, color, dir, piecesToFlip)
      let subCount = 0;
      for (let j = 0; j < possibleDirs.length; j++){
        let flipArr = this.board.ptof(this.board, aiMoves[i], "white", possibleDirs[j], []);
        if (flipArr !== null){
          subCount += flipArr.length;
        }
      }
      if (subCount > highestCount){
        highestCount = subCount;
        bestMove = aiMoves[i];
      }
    }
    console.log(bestMove);
    this.board.placePiece(bestMove, "white");
    this._flipTurn();
    callback();
  }

  
  function handleResponse(answer) {
    const pos = JSON.parse(answer);
    if (!this.board.validMove(pos, this.turn)) {
      console.log("Invalid move!");
      this.playTurn(callback);
      return;
    }

    this.board.placePiece(pos, this.turn);
    this._flipTurn();
    callback();
  }
};

/**
 * Continues game play, switching turns, until the game is over.
 */
Game.prototype.runLoop = function (overCallback) {
  if (this.board.isOver()) {
    console.log("The game is over!");
    overCallback();
  } else if (!this.board.hasMove(this.turn)) {
    console.log(`${this.turn} has no move!`);
    this._flipTurn();
    this.runLoop();
  } else {
    this.playTurn(this.runLoop.bind(this, overCallback));
  }
};

module.exports = Game;
