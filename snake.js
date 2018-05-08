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
    var foodImg = new Image();
        foodImg.src = './Pictures/pear_resized.png';
    
    var gameLoop;
    var endgame;

    //creates the snake 
    var snake;
    var newX;
    var newY;

    $("#start-btn").click(function() {
        startGame();
        $(".start-menu").remove();
    })
    function startGame() {
        // loadImages();
        //sets the initial snake direction to right
        snakeDirection = "right";
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
        ctx.fillStyle = "grey";
        ctx.fillRect(0, 0, width, height);
        ctx.strokeStyle = "black";
        ctx.strokeRect(0, 0, width, height);
    }

    /**
     * The animation required to move the snake removes the tail and places it as the head.
     */
    function moveSnake() {
        var tail;
        //passes the x and y head of the snake to the respective variables
        newX = snake[0].x;
        newY = snake[0].y;

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
            tail = {x: newX, y: newY };
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
            paintCell(snake[i].x, snake[i].y, "blue");
        }
    }

    // returns true if snake head is in the same position as the food
    // 
    function eatFood() {
        return ( (newX >= (food.x-foodImg.width/(2*cellWidth)) && newX <= (food.x + foodImg.width/(2*cellWidth))) 
            && (newY >= (food.y - foodImg.height/(2*cellWidth)) && newY <= (food.y + foodImg.height/(2*cellWidth))));
    }
    function drawFood() {
        
        console.log (foodImg.width);
        ctx.drawImage(foodImg,food.x*cellWidth, (food.y)*cellWidth);
        //paintCell(food.x, food.y, "red");
    }
    function drawGame() {
        drawBoard();
        moveSnake();
        drawFood();
        
    }
    /**
     * Returns true if the snake head is out of the screen
     */
    function outOfBounds(x,y) {
        return (newX < 0 || newY < 0 || newX >= width/cellWidth || newY >= height/cellWidth);
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
        
    }
    /*changes the snakeDirection of the snake */
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

})




