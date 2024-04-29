const UP = [0, -1];
const DOWN = [0, 1];
const LEFT = [-1, 0];
const RIGHT = [1, 0];
const BLOCK_SIZE = 20;

let socket = new WebSocket('ws://localhost:3000/game');

socket.onopen = function(event) {
    console.log('WebSocket connection established.');
};

socket.onerror = function(error) {
    console.error('WebSocket error:', error);
};

document.addEventListener('keydown', function(event) {
    let direction;
    switch (event.key) {
        case 'ArrowUp':
            direction = UP;
            break;
        case 'ArrowDown':
            direction = DOWN;
            break;
        case 'ArrowLeft':
            direction = LEFT;
            break;
        case 'ArrowRight':
            direction = RIGHT;
            break;
        default:
            return;
    }
    socket.send(JSON.stringify({'direction': direction}));
});

socket.onmessage = function(event) {
    try {
        let gameState = JSON.parse(event.data);
        let canvas = document.getElementById('gameCanvas');
        let ctx = canvas.getContext('2d');

        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw snakes
        for (let player of gameState.players) {
            drawPlayer(ctx, player);
        }

        // Draw food
        drawFood(ctx, gameState.food);

    } catch (error) {
        console.error('Error parsing game state:', error);
    }
};

function drawPlayer(ctx, player) {
    ctx.fillStyle = 'green';
    ctx.fillRect(player.position[0], player.position[1], BLOCK_SIZE, BLOCK_SIZE);
}

function drawFood(ctx, food) {
    ctx.fillStyle = 'red';
    ctx.fillRect(food[0], food[1], BLOCK_SIZE, BLOCK_SIZE);
}
