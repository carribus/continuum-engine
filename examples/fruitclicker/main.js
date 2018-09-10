import Game from "./game.js"

let game;

window.onload = function () {
    game = new Game();
    gameLoop();
};

function gameLoop(dt) {
    game.onTick(Date.now());
    window.requestAnimationFrame(gameLoop);
}

