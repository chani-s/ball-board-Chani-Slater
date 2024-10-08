var WALL = 'WALL';
var FLOOR = 'FLOOR';
var BALL = 'BALL';
var GAMER = 'GAMER';

var GAMER_IMG = '<img src="img/gamer.png" />';
var BALL_IMG = '<img src="img/ball.png" />';

var gBoard;
var gGamerPos;

let collectedBallsCount = 0;

let intervalId;
let isGameOver = false; // Flag to indicate if the game is over



function initGame() {
	isGameOver = false; // Reset the game over flag when restarting

	gGamerPos = { i: 2, j: 9 };
	gBoard = buildBoard();
	renderBoard(gBoard);

	intervalId = setInterval(displayRandomBall, 5000); // Start the interval to add balls
}


function buildBoard() {
	// Create the Matrix
	// var board = createMat(10, 12)
	var board = new Array(10);
	for (var i = 0; i < board.length; i++) {
		board[i] = new Array(12);
	}

	// Put FLOOR everywhere and WALL at edges
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			// Put FLOOR in a regular cell
			var cell = { type: FLOOR, gameElement: null };

			// Place Walls at edges
			if (i === 0 || i === board.length - 1 || j === 0 || j === board[0].length - 1) {
				if (i === 3 || j === 2) // Place a transition cell
					cell.type = FLOOR;
				else
					cell.type = WALL;
			}

			// Add created cell to The game board
			board[i][j] = cell;
		}
	}

	// Place the gamer at selected position
	board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;

	// Place the Balls (currently randomly chosen positions)
	board[3][8].gameElement = BALL;
	board[7][4].gameElement = BALL;

	console.log(board);
	return board;
}

// Render the board to an HTML table
function renderBoard(board) {

	var strHTML = '';
	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>\n';
		for (var j = 0; j < board[0].length; j++) {
			var currCell = board[i][j];

			var cellClass = getClassName({ i: i, j: j })

			// TODO - change to short if statement
			if (currCell.type === FLOOR) cellClass += ' floor';
			else if (currCell.type === WALL) cellClass += ' wall';

			//TODO - Change To ES6 template string
			strHTML += '\t<td class="cell ' + cellClass + '"  onclick="moveTo(' + i + ',' + j + ')" >\n';

			// TODO - change to switch case statement
			if (currCell.gameElement === GAMER) {
				strHTML += GAMER_IMG;
			} else if (currCell.gameElement === BALL) {
				strHTML += BALL_IMG;
			}

			strHTML += '\t</td>\n';
		}
		strHTML += '</tr>\n';
	}

	console.log('strHTML is:');
	console.log(strHTML);
	var elBoard = document.querySelector('.board');
	elBoard.innerHTML = strHTML;
}

function getRandomInt(min, max) {

	return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Display a ball in a random location every 2 seconds using setInterval
function displayRandomBall() {
	if (isGameOver) return;

	var i = getRandomInt(1, gBoard.length - 2);
	var j = getRandomInt(1, gBoard[0].length - 2);

	var targetCell = gBoard[i][j];
	if (targetCell.gameElement === null) {
		targetCell.gameElement = BALL;
		renderCell({ i: i, j: j }, BALL_IMG);
	}
}


// Move the player to a specific location
function moveTo(i, j) {
    if (isGameOver) return; // Stop adding balls if the game is over

    var targetCell = gBoard[i][j];

    if (targetCell.type === WALL) return;

    // Bypass the normal distance check for transition cells
    if (!isTransition(i, j)) {
        // Calculate distance to make sure we are moving to a neighbor cell
        var iAbsDiff = Math.abs(i - gGamerPos.i);
        var jAbsDiff = Math.abs(j - gGamerPos.j);

        // If the clicked Cell is not one of the four allowed, return
        if (!((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0))) {
            return;
        }
    }

    // Collect a ball if present
    if (targetCell.gameElement === BALL) {
        targetCell.gameElement = null;
        renderCell({ i: i, j: j }, '');

        console.log('Collecting!');
        collectedBallsCount++;
        updateCollectedBallsDisplay();
    }

    // MOVING from current position
    gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
    renderCell(gGamerPos, '');

    // MOVING to selected position
    gGamerPos.i = i;
    gGamerPos.j = j;
    gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
    renderCell(gGamerPos, GAMER_IMG);

    // Check if all balls are collected after moving
    if (checkAllBallsCollected()) {
        setTimeout(function () {
            alert('WIN!!! You collected all the balls!');
            clearInterval(intervalId);
            isGameOver = true;
        }, 100); // Slight delay to allow last move to complete
    }
}



function updateCollectedBallsDisplay() {
	var elCollectedBalls = document.querySelector('.collected-balls-count');
	elCollectedBalls.innerText = 'Balls Collected: ' + collectedBallsCount;
}


// Check if all balls are collected
function checkAllBallsCollected() {
	for (var i = 0; i < gBoard.length; i++) {
		for (var j = 0; j < gBoard[0].length; j++) {
			if (gBoard[i][j].gameElement === BALL) {
				return false; // Found a ball that is not collected
			}
		}
	}
	return true; // All balls are collected
}


// Reset the game
function resetGame() {
	initGame();
}


// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
	var cellSelector = '.' + getClassName(location)
	var elCell = document.querySelector(cellSelector);
	elCell.innerHTML = value;
}


// Move the player by keyboard arrows
function handleKey(event) {
    var i = gGamerPos.i;
    var j = gGamerPos.j;

    switch (event.key) {
        case 'ArrowLeft':
            [i, j] = checkIfTransition(i, j - 1); // Try moving left
            break;
        case 'ArrowRight':
            [i, j] = checkIfTransition(i, j + 1); // Try moving right
            break;
        case 'ArrowUp':
            [i, j] = checkIfTransition(i - 1, j); // Try moving up
            break;
        case 'ArrowDown':
            [i, j] = checkIfTransition(i + 1, j); // Try moving down
            break;
    }

    // Move to the new position after transition check
    moveTo(i, j);
}


function checkIfTransition(i, j) {
    var maxRow = gBoard.length - 1;
    var maxCol = gBoard[0].length - 1;

    // Transition in horizontal direction (left-right)
    if (i === 3 && j < 0) {
        j = maxCol; // Move to the last column on row 3
    } else if (i === 3 && j > maxCol) {
        j = 0; // Move to the first column on row 3
    }

    // Transition in vertical direction (top-bottom)
    if (j === 2 && i < 0) {
        i = maxRow; // Move to the last row on column 2
    } else if (j === 2 && i > maxRow) {
        i = 0; // Move to the first row on column 2
    }

    return [i, j];
}

// Check if the player is on a transition cell
function isTransition(i, j) {
    return (i === 3 && (j === 0 || j === gBoard[0].length - 1)) ||
           (j === 2 && (i === 0 || i === gBoard.length - 1));
}


// Returns the class name for a specific cell
function getClassName(location) {
	var cellClass = 'cell-' + location.i + '-' + location.j;
	console.log('cellClass:', cellClass);
	return cellClass;
}

