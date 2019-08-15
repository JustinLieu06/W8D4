let Piece = require("./piece");

/**
 * Returns a 2D array (8 by 8) with two black pieces at [3, 4] and [4, 3]
 * and two white pieces at [3, 3] and [4, 4]
 */
function _makeGrid () {
  let arr = new Array(8);
  
  for (let i = 0; i < arr.length; i++){
    arr[i] = new Array(8);
  }
  arr[3][4] = new Piece('black');
  arr[4][3] = new Piece('black');
  arr[3][3] = new Piece('white');
  arr[4][4] = new Piece('white');
  return arr;
}

/**
 * Constructs a Board with a starting grid set up.
 */
function Board () {
  this.grid = _makeGrid();
}

Board.DIRS = [
  [ 0,  1], [ 1,  1], [ 1,  0],
  [ 1, -1], [ 0, -1], [-1, -1],
  [-1,  0], [-1,  1]
];

/**
 * Returns the piece at a given [x, y] position,
 * throwing an Error if the position is invalid.
 */
Board.prototype.getPiece = function (pos) {
  let spot = this.grid[pos[0]][pos[1]];
  if (outOfBounds(pos)){
    throw 'Invalid Position';
  }
  else {
    return spot;
  }
};

/**
 * Checks if there are any valid moves for the given color.
 */
Board.prototype.hasMove = function (color) {
  for (let i = 0; i < 8; i++){
    for (let j = 0; j < 8; j++){
      if (this.validMove([i,j],color)){
        return true;
      }
    }
  }
  return false;
};

/**
 * Checks if the piece at a given position
 * matches a given color.
 */
Board.prototype.isMine = function (pos, color) {
  if (outOfBounds(pos)){
    return false;
  }
  let currPiece = this.grid[pos[0]][pos[1]];
  if (currPiece === undefined){
    return false;
  }
  if (currPiece.color === color){
    return true;
  }
  return false;
};

/**
 * Checks if a given position has a piece on it.
 */
Board.prototype.isOccupied = function (pos) {
  if (outOfBounds(pos)) {
    return false;
  }
  let currPiece = this.grid[pos[0]][pos[1]]
  if (currPiece !== undefined){
    return true;
  }
  return false;
};

/**
 * Checks if both the white player and
 * the black player are out of moves.
 */
Board.prototype.isOver = function () {
  if (this.hasMove("black") || this.hasMove("white")){
    return false;
  }
  return true;
};

/**
 * Checks if a given position is on the Board.
 */
Board.prototype.isValidPos = function (pos) {
  return !outOfBounds(pos);
};

/**
 * Recursively follows a direction away from a starting position, adding each
 * piece of the opposite color until hitting another piece of the current color.
 * It then returns an array of all pieces between the starting position and
 * ending position.
 *
 * Returns null if it reaches the end of the board before finding another piece
 * of the same color.
 *
 * Returns null if it hits an empty position.
 *
 * Returns null if no pieces of the opposite color are found.
 */
function _positionsToFlip (board, pos, color, dir, piecesToFlip) {
  let newPos = [pos[0] + dir[0], pos[1] + dir[1]];
  
  //reaches end of the board
  if (outOfBounds(newPos)) {
    return null;
  }
  //if it hits an empty position
  let currPiece = board.grid[newPos[0]][newPos[1]];
  if (currPiece === undefined){
    return null;
  }
  //if same color, don't add anything to piecetoflip and return
  if (currPiece.color === color){
    return piecesToFlip;
  }
  //if diff color, add to piecestoflip 
  else {
    piecesToFlip.push(currPiece);
    return _positionsToFlip(board, newPos, color, dir, piecesToFlip);
  }
}

Board.prototype.ptof = function (board, pos, color, dir, piecesToFlip) {
  let newPos = [pos[0] + dir[0], pos[1] + dir[1]];

  //reaches end of the board
  if (outOfBounds(newPos)) {
    return null;
  }
  //if it hits an empty position
  let currPiece = board.grid[newPos[0]][newPos[1]];
  if (currPiece === undefined) {
    return null;
  }
  //if same color, don't add anything to piecetoflip and return
  if (currPiece.color === color) {
    return piecesToFlip;
  }
  //if diff color, add to piecestoflip 
  else {
    piecesToFlip.push(currPiece);
    return _positionsToFlip(board, newPos, color, dir, piecesToFlip);
  }
};

/**
 * Adds a new piece of the given color to the given position, flipping the
 * color of any pieces that are eligible for flipping.
 *
 * Throws an error if the position represents an invalid move.
 */
Board.prototype.placePiece = function (pos, color) {

  if (!this.validMove(pos, color)){
    throw new Error("Invalid Move");
  }
  this.grid[pos[0]][pos[1]] = new Piece(color);
  for (let i = 0; i < Board.DIRS.length; i++){
    let dir = Board.DIRS[i];
    let flipArray = _positionsToFlip(this, pos, color, dir, []);
    if (flipArray === null){
      continue;
    }
    for (let j = 0; j < flipArray.length; j++){
      flipArray[j].flip();
    }
  }
};

/**
 * Prints a string representation of the Board to the console.
 */
Board.prototype.print = function () {
  console.log("  0  1  2  3  4  5  6  7");
  for(let i = 0; i < this.grid.length; i ++){
    let str = "";
    for(let j = 0; j < this.grid[0].length; j++){
      if (this.grid[i][j] === undefined){
        str += "-  ";
      }
      else{
        str += this.grid[i][j].toString();
        str += "  ";
      }
    }
    console.log(i + " " + str);
  }
};

/**
 * Checks that a position is not already occupied and that the color
 * taking the position will result in some pieces of the opposite
 * color being flipped.
 */
Board.prototype.validMove = function (pos, color) {
  if (outOfBounds(pos)){
    return false;
  }
  
  if (this.grid[pos[0]][pos[1]] !== undefined) {
    return false;
  }
  
  for(let i = 0; i < Board.DIRS.length; i ++){
    let dir = Board.DIRS[i];
    let currentPos = [pos[0] + dir[0], pos[1] + dir[1]];
    
    if (outOfBounds(currentPos)){
      continue;
    }
    let currentPiece = this.getPiece(currentPos);
    if (currentPiece === undefined || currentPiece.color === color) {
      continue;
    }
    while (true){
      currentPos = [currentPos[0] + dir[0], currentPos[1] + dir[1]];
      // console.log(currentPos);
      if (outOfBounds(currentPos)){
        break;
      }
      currentPiece = this.getPiece(currentPos);
      if (currentPiece === undefined){
        break;
      }
      if (currentPiece.color === color){
        return true;
      }
    }  
  }
  
  return false;
};

function outOfBounds(pos) {
  if (pos[0] > 7 || pos[0] < 0 || pos[1] > 7 || pos[1] < 0) {
    return true;
  }
  return false;
}

/**
 * Produces an array of all valid positions on
 * the Board for a given color.
 */
Board.prototype.validMoves = function (color) {
  let ret = [];
  for (let i = 0; i < this.grid.length; i++){
    for (let j = 0; j < this.grid[0].length; j++){
      if (this.validMove([i, j], color)){
        ret.push([i, j]);
      }
    }
  }
  return ret;
};

module.exports = Board;
