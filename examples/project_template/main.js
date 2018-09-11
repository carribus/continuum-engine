import Game from "./game.js"

const game;

window.onload = function () {
    game = new Game();
    gameLoop();
};

function gameLoop(dt) {
    window.requestAnimationFrame(gameLoop);
    game.onTick(Date.now());
}

