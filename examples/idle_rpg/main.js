import Game from "./game.js"

let game;

window.onload = function() {
    game = new Game();
    window.requestAnimationFrame(onTick);
};

function onTick(dt) {
    game.onTick(dt);
    window.requestAnimationFrame(onTick);        
}

