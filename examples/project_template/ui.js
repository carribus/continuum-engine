export default class UI {
    constructor(game) {
        this.game = game;

        // create the PIXI app/stage etc
        this.app = new PIXI.Application({
            width: 1024,
            height: 768,
            antialias: true,
            resolution: 1,
            backgroundColor: 0xFFFFFF
        });
        document.getElementById('game').appendChild(this.app.view);
        // ensure that the canvas always resizes to fill the available area
        this.app.renderer.view.style.position = "absolute";
        this.app.renderer.view.style.display = "block";
        this.app.renderer.autoResize = true;
        this.app.renderer.resize(window.innerWidth, window.innerHeight);
        window.onresize = (e) => {
            this.app.renderer.resize(window.innerWidth, window.innerHeight);
            this.repositionSprites();
        }

        this.init();
    }

    init() {
        // create your display objects here
        const logo = new PIXI.Text("Continuum\nEngine", new PIXI.TextStyle({
            fontSize: 48,
            fontStyle: "bold",
            fill: 0x404080,
            align: "left",
            dropShadow: true,
            dropShadowColor: "#c0c0c0",
            dropShadowBlur: 4,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 6,
        }));
        logo.x = logo.y = 20;
        this.app.stage.addChild(logo);

        this.dotSprite = new PIXI.Text("", new PIXI.TextStyle({
            fontFamily: "Arial",
            fontSize: 48,
            fill: "black",
            align: "left"
        }));
        this.dotSprite.x = 170;
        this.dotSprite.y = 75;
        this.app.stage.addChild(this.dotSprite);
    }

    addDot(e) {
        if ( e.output.state.value % 6 === 0 )
            this.dotSprite.text = "";
        this.dotSprite.text += '.';
    }

    repositionSprites() {
        // add code here to reposition all sprites as necessary
    }

    update(dt) {
        // update display objects here. this is called up 60 times a second
    }
}