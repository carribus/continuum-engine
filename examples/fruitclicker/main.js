import Game from "./game.js"

let game;

window.onload = function () {
    game = new Game();
    gameLoop();
};

function gameLoop(dt) {
    window.requestAnimationFrame(gameLoop);
    game.onTick(Date.now());
}

