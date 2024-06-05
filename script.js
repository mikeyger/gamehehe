document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('#game-grid');
    const scoreDisplay = document.querySelector('#score');
    const width = 10;
    let squares = Array.from({ length: 200 }, () => {
        const div = document.createElement('div');
        grid.appendChild(div);
        return div;
    });

    // Add the 'taken' class to the bottom row
    for (let i = 0; i < width; i++) {
        const div = document.createElement('div');
        div.classList.add('taken');
        grid.appendChild(div);
        squares.push(div);
    }

    let currentPosition = 4;
    let currentRotation = 0;
    let score = 0;
    let timerId;
    let paused = false;
    const images = [
        'url(red.jpg)',
        'url(red.jpg)',
        'url(red.jpg)',
        'url(red.jpg)',
        'url(red.jpg)',
        'url(red.jpg)',
        'url(red.jpg)',
    ];

    // Tetrominoes
    const lTetromino = [
        [1, width + 1, width * 2 + 1, 0],
        [width, width + 1, width + 2, 2],
        [1, width + 1, width * 2 + 1, width * 2 + 2],
        [width, width * 2, width * 2 + 1, width * 2 + 2]
    ];

    const zTetromino = [
        [0, width, width + 1, width * 2 + 1],
        [width + 1, width + 2, width * 2, width * 2 + 1],
        [0, width, width + 1, width * 2 + 1],
        [width + 1, width + 2, width * 2, width * 2 + 1]
    ];

    const tTetromino = [
        [1, width, width + 1, width + 2],
        [1, width + 1, width + 2, width * 2 + 1],
        [width, width + 1, width + 2, width * 2 + 1],
        [1, width, width + 1, width * 2 + 1]
    ];

    const oTetromino = [
        [0, 1, width, width + 1],
        [0, 1, width, width + 1],
        [0, 1, width, width + 1],
        [0, 1, width, width + 1]
    ];

    const iTetromino = [
        [1, width + 1, width * 2 + 1, width * 3 + 1],
        [width, width + 1, width + 2, width + 3],
        [1, width + 1, width * 2 + 1, width * 3 + 1],
        [width, width + 1, width + 2, width + 3]
    ];

    const mlTetromino = [
        [1, width + 1, width * 2 + 1, 0],
        [width, width + 1, width + 2, 2],
        [1, width + 1, width * 2 + 1, width * 2 + 2],
        [width + 2, width * 2, width * 2 + 1, width * 2 + 2]
    ];

    const mzTetromino = [
        [1, width, width + 1, width * 2],
        [width + 1, width + 2, width * 2, width * 2 + 1],
        [1, width, width + 1, width * 2],
        [width + 1, width + 2, width * 2, width * 2 + 1]
    ];

    const theTetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino, mlTetromino, mzTetromino];

    let random = Math.floor(Math.random() * theTetrominoes.length);
    let current = theTetrominoes[random][currentRotation];

    // Draw the Tetromino
    function draw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.add('tetromino');
            squares[currentPosition + index].style.backgroundImage = images[random];
        });
    }

    // Undraw the Tetromino
    function undraw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.remove('tetromino');
            squares[currentPosition + index].style.backgroundImage = '';
        });
    }

    // Move down function
    function moveDown() {
        undraw();
        currentPosition += width;
        draw();
        freeze();
    }

    // Freeze function
    function freeze() {
        if (current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
            current.forEach(index => squares[currentPosition + index].classList.add('taken'));
            // Start a new tetromino falling
            random = Math.floor(Math.random() * theTetrominoes.length);
            current = theTetrominoes[random][currentRotation];
            currentPosition = 4;
            draw();
            addScore();
            gameOver();
        }
    }

    // Move the Tetromino left, unless at the edge or there's a blockage
    function moveLeft() {
        undraw();
        const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0);

        if (!isAtLeftEdge) currentPosition -= 1;

        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition += 1;
        }

        draw();
    }

    // Move the Tetromino right, unless at the edge or there's a blockage
    function moveRight() {
        undraw();
        const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1);

        if (!isAtRightEdge) currentPosition += 1;

        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition -= 1;
        }

        draw();
    }

    // Rotate the Tetromino
    function rotate() {
        undraw();
        const oldRotation = currentRotation;
        currentRotation++;
        if (currentRotation === current.length) {
            currentRotation = 0;
        }
        current = theTetrominoes[random][currentRotation];

        // Check if the new rotation is valid
        const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0);
        const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1);
        const hasCollided = current.some(index => squares[currentPosition + index].classList.contains('taken'));

        if (isAtLeftEdge || isAtRightEdge || hasCollided) {
            currentRotation = oldRotation;
            current = theTetrominoes[random][currentRotation];
        }
        draw();
    }

    // Instantly drop the Tetromino to the bottom
    function instantDrop() {
        undraw();
        while (!current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
            currentPosition += width;
        }
        draw();
        freeze();
    }

    // Add score
    function addScore() {
        for (let i = 0; i < 199; i += width) {
            const row = [i, i + 1, i + 2, i + 3, i + 4, i + 5, i + 6, i + 7, i + 8, i + 9];

            if (row.every(index => squares[index].classList.contains('taken'))) {
                score += 10;
                scoreDisplay.innerHTML = score;
                row.forEach(index => {
                    squares[index].classList.remove('taken');
                    squares[index].classList.remove('tetromino');
                    squares[index].style.backgroundImage = '';
                });
                const squaresRemoved = squares.splice(i, width);
                squares = squaresRemoved.concat(squares);
                squares.forEach(cell => grid.appendChild(cell));
            }
        }
    }

    // Game over
    function gameOver() {
        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            scoreDisplay.innerHTML = 'end';
            clearInterval(timerId);
        }
    }

    // Event listeners
    document.addEventListener('keydown', control);

    function control(e) {
        if (e.keyCode === 37) {
            moveLeft();
        } else if (e.keyCode === 38) {
            rotate();
        } else if (e.keyCode === 39) {
            moveRight();
        } else if (e.keyCode === 40) {
            moveDown();
        } else if (e.keyCode === 32) { // Space bar
            instantDrop();
        } else if (e.keyCode === 27) { // Esc key
            togglePause();
        }
    }

    function togglePause() {
        if (paused) {
            timerId = setInterval(moveDown, 1000);
        } else {
            clearInterval(timerId);
        }
        paused = !paused;
    }

    // Start the game
    timerId = setInterval(moveDown, 1000);
    draw();
});
