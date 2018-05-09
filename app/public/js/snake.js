$(document).ready(function () {
    //Sets up the canvas for the game
    var canvas = document.getElementById("stage");
    var ctx = canvas.getContext("2d");
    var width = $("#stage").width();
    var height = $("#stage").height();

    //
    var cellWidth = 10;
    var snakeDirection;
    var food;
    var score;

    // sets the image of the snake food
    var foodImg = new Image();
        foodImg.src = './Pictures/pear_resized.png';
    var gameLoop;
    var endgame;

    //creates the snake 
    var snake;
    var newX;
    var newY;

    $("#start-btn").click(function () {
        //shows the game screen
        $('canvas').show();
        startGame();
        $(".start-menu").hide();
        $("#game-controller").show();
    })
    function startGame() {
        $(".end-menu").hide();
        //sets the initial snake direction to right
        snakeDirection = "right";
        score = 0;
        createSnake();
        createFood();
        gameLoop = setInterval(drawGame, 60);
    }
    function createSnake() {
        //Starting length of the snake
        var startLength = 5;

        // initializes snake with an array
        snake = [];
        //Fills each index of the array with a x-pos and a y-position
        for (var i = 0; i < startLength; i++) {
            //This will create a horizontal snake starting from the top left
            snake.unshift({ x: i, y: 0 });
        }
    }

    function createFood() {
        food = {
            x: Math.floor(Math.random() * (width - cellWidth) / cellWidth),
            y: Math.floor(Math.random() * (width - cellWidth) / cellWidth)
        };
    }

    function drawBoard() {
        //Clears the board
        ctx.clearRect(0, 0, width, height);

        //draws the game stage
        ctx.fillStyle = "#4EB266";
        ctx.fillRect(0, 0, width, height);
        ctx.strokeStyle = "black";
        ctx.strokeRect(0, 0, width, height);

        $("#score").text("Score: " + score);
    }

    /**
     * The animation required to move the snake removes the tail and places it as the head.
     */
    function moveSnake() {
        var tail;
        //passes the x and y head of the snake to the respective variables
        newX = snake[0].x;
        newY = snake[0].y;

        //increments or decrements the x and y position of the snake based on the snake's current direction
        switch (snakeDirection) {
            case "right":
                newX++;
                break;
            case "left":
                newX--;
                break;
            case "up":
                newY--;
                break;
            case "down":
                newY++;
                break;
        }
        //if the snake is eating food, then just add the new position to the head and create new food
        if (eatFood()) {
            tail = { x: newX, y: newY };
            score++;
            createFood();
        } else {
            tail = snake.pop(); //removes the tail and sets
            tail.x = newX;
            tail.y = newY;
        }

        if (collisionCheck(this.newX, this.newY, snake) || outOfBounds(this.newX, this.newY)) {
            gameOver();
        }
        //adds the tail to the front of the snake (becomes the new head) 
        snake.unshift(tail);;
        // for each index of the snake array, paint the cell the specified color
        for (var i = 0; i < snake.length; i++) {
            //accesses the x and y coordinates at the specific index
            //paint the cells with the color according to the cellWidth;
            paintCell(snake[i].x, snake[i].y, "white");
        }
    }

    // returns true if snake head is in the same position as the food
    // the position of the food is offset by the image width and height divided by the cellWidth
    function eatFood() {
        return ((newX >= (food.x - foodImg.width / (2 * cellWidth)) && newX <= (food.x + foodImg.width / (2 * cellWidth)))
            && (newY >= (food.y - foodImg.height / (2 * cellWidth)) && newY <= (food.y + foodImg.height / (2 * cellWidth))));
    }
    function drawFood() {
        ctx.drawImage(foodImg, food.x * cellWidth, (food.y) * cellWidth);
    }
    function drawGame() {
        drawBoard();
        moveSnake();
        drawFood();

    }
    /**
     * Returns true if the snake head is out of the screen
     */
    function outOfBounds(x, y) {
        return (newX < 0 || newY < 0 || newX >= width / cellWidth || newY >= height / cellWidth);
    }

    /**Checks if the snake has collided with its own body */
    function collisionCheck(xPos, yPox, snakeArray) {
        for (var i = 0; i < snake.length; i++) {
            if (snake[i].x === newX && snake[i].y === newY) {
                return true;
            }
        }
        return false;
    }
    /** Takes in the x-coordinate and y-coordinate of the cell to be painted.
     * Paints the cell in the indicated color
     */
    function paintCell(x, y, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x * cellWidth, y * cellWidth, cellWidth, cellWidth);
        ctx.strokeStyle = "white";
        ctx.strokeRect(x * cellWidth, y * cellWidth, cellWidth, cellWidth);
    }

    //
    function gameOver() {
        clearInterval(gameLoop);
        $(".end-menu").show();
        $("#end-score").text("Final score: " + score);
        

    }
    /*changes the snakeDirection of the snake  using a keyboard*/
    $(document).keydown(function (event) {
        var key = event.which;
        //We will add another clause to prevent reverse gear
        if (key == "37" && snakeDirection != "right") {
            snakeDirection = "left";
        } else if (key == "38" && snakeDirection != "down") {
            snakeDirection = "up";
        } else if (key == "39" && snakeDirection != "left") {
            snakeDirection = "right";
        } else if (key == "40" && snakeDirection != "up") {
            snakeDirection = "down";
        }
    });

    //Controls for a touch screen
    $("#up").click(function () {
        if (snakeDirection != "down") {
            snakeDirection = "up";
        }
    });
    $("#down").click(function () {
        if (snakeDirection != "up") {
            snakeDirection = "down";
        }
    });
    $("#left").click(function () {
        if (snakeDirection != "right") {
            snakeDirection = "left";
        }
    });
    $("#right").click(function () {
        if (snakeDirection != "left") {
            snakeDirection = "right";
        }
    });

    $("#restart-btn").click(function() {
        startGame();
    })
})




