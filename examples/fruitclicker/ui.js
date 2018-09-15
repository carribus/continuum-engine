import FruitAssets from "./resources.js"

export default class GameUI {
    constructor(parentElem) {
        this.sprites = {
            header: null,
            score: null,
            fruit: null,
            taps: []
        };
        this.textures = {
            fruit: {}
        }
        this.headerHeight = 75;
        this.game = null;
        // the fruit that is currently being clicked
        this.activeFruitName = null;
        // create pixi application and attach the canvas to the document

        this.app = new PIXI.Application({
            width: 1024, 
            height: 768,
            antialias: true,
            resolution: 1,
            backgroundColor: 0x4080FF
        });
        parentElem.appendChild(this.app.view);
        window.onresize = (e) => {
            this.app.renderer.resize(window.innerWidth, window.innerHeight);

            if (this.sprites.fruit) {
                this.updateFruitSpriteOrientation(this.sprites.fruit);
                this.sprites.header.children[0].width = this.app.view.width;
            }
        }

        this.app.renderer.view.style.position = "absolute";
        this.app.renderer.view.style.display = "block";
        this.app.renderer.autoResize = true;
        this.app.renderer.resize(window.innerWidth, window.innerHeight);
    }

    init(Game) {
        // create the displayobjects for the header on the game
        const createHeader = () => {
            const header = new PIXI.Container();
            header.x = 0;
            header.y = 0;

            let o = new PIXI.Graphics();
            o.beginFill(0xf88379);
            o.drawRect(0, 0, Number.MAX_SAFE_INTEGER, this.headerHeight);
            o.endFill();
            o.x = o.y = 0;
            header.addChild(o);

            o = new PIXI.Text('Fruit Clicker', new PIXI.TextStyle({
                fontFamily: "Arial",
                fontSize: 42,
                fill: "black",
            }));
            o.x = o.y = 5;
            header.addChild(o);

            o = new PIXI.Text('Continuum Engine', new PIXI.TextStyle({
                fontFamily: "Arial",
                fontStyle: "italic",
                fontSize: 16,
                fill: 0xFFFFFF,
            }));
            o.x = 100;
            o.y = 45;
            header.addChild(o);

            this.app.stage.addChild(header);
        };

        // create the one and only fruit sprite and setup the user event handlers
        const createFruitSprite = (assets) => {
            const sprite = new PIXI.Sprite(PIXI.loader.resources[Object.keys(assets)[0]].texture);
            sprite.interactive = true;
            sprite.on("tap", this.onFruitTapped.bind(this));
            sprite.on("mousedown", this.onFruitTapped.bind(this));
            this.app.stage.addChild(sprite);
            return sprite;
        };

        // create the text object that shows the score
        const createScoreTextObject = () => {
            const sprite = new PIXI.Text(`${Game.score} Juice`, new PIXI.TextStyle({
                fontfamily: "Arial",
                fontSize: 48,
                fill: "white",
                stroke: '#000080',
                strokeThickness: 6,
                dropShadow: true,
                dropShadowColor: "#000000",
                dropShadowBlur: 4,
                dropShadowAngle: Math.PI / 6,
                dropShadowDistance: 6,
            }));
            if (window.devicePixelRatio <= 1 ) {
                sprite.scale.x = sprite.scale.y = 0.5;
            }
            this.app.stage.addChild(sprite);
            sprite.position.set(10, this.headerHeight + 10);

            return sprite;
        }

        // setup the text object that shows the progress to the next fruit
        const createJuiceToNextLevelTextObject = () => {
            const sprite = new PIXI.Text('', new PIXI.TextStyle({
                fontfamily: "Arial",
                fontSize: 48,
                align: "right",
                fill: "white",
                stroke: '#000080',
                strokeThickness: 6,
                dropShadow: true,
                dropShadowColor: "#000000",
                dropShadowBlur: 4,
                dropShadowAngle: Math.PI / 6,
                dropShadowDistance: 6,
            }));
            if (window.devicePixelRatio <= 1) {
                sprite.scale.x = sprite.scale.y = 0.5;
            }
            this.app.stage.addChild(sprite);
            sprite.position.set(this.app.view.width-sprite.width, this.headerHeight + 10);

            return sprite;
        }

        // setup the auto-clicker buy button
        const createBuyAutoClickerButton = () => {
            const sprite = new PIXI.Text(`Buy 1 AutoClicker\nCost: ${this.game.producer.calculateCost(1).price} Juice`, new PIXI.TextStyle({
                fontfamily: "Arial",
                fontSize: 32,
                align: "left",
                fill: "white",
            }));
            sprite.position.set(10, this.app.view.height - sprite.height - 10);
            sprite.interactive = true;
            sprite.on('tap', this.onBuyPressed.bind(this));
            sprite.on('mousedown', this.onBuyPressed.bind(this));
            this.app.stage.addChild(sprite);

            return sprite;
        }

        // setup the tap power increase button
        const createBuyTapPowerButton = () => {
            const sprite = new PIXI.Text(`Increase Tap Power\nCost: ${this.game.calculateTapPowerCost(1)} Juice`, new PIXI.TextStyle({
                fontfamily: "Arial",
                fontSize: 32,
                align: "right",
                fill: "white",
            }));
            sprite.position.set(this.app.view.width - sprite.width - 10, this.app.view.height - sprite.height - 10);
            sprite.interactive = true;
            sprite.on('tap', this.onBuyTapPowerPressed.bind(this));
            sprite.on('mousedown', this.onBuyTapPowerPressed.bind(this));
            this.app.stage.addChild(sprite);

            return sprite;
        }

        this.game = Game;
        this.sprites.header = createHeader();
        this.game.producer.on("PRODUCER_OUTPUT", (e) => {
            this.createFloatingTapValue(e.delta, 75, this.app.view.height-100);
            this.game.incrementScore(e.delta);
        });

        // load the fruit assets
        PIXI.loader
            .add(FruitAssets)
            .on("progress", (e) => {
                console.log(`Loading assets: ${e.progress}%`);
            })
            .load((e, assets) => {
                console.log('Finished loading assets');
                
                // create the one and only fruit sprite
                this.sprites.fruit = createFruitSprite(assets);

                // if the Game object has been initialised with the starting fruit, set it up
                if (Game.currentFruit) {
                    this.currentFruit = Game.currentFruit.name;
                }

                // create the score text field
                this.sprites.score = createScoreTextObject();
                this.sprites.juiceLeft = createJuiceToNextLevelTextObject();

                this.sprites.buy = createBuyAutoClickerButton();
                this.sprites.buyTapPower = createBuyTapPowerButton();
            });
    }

    updateFruitSpriteOrientation(sprite) {
        // reset the sprite's scale in preparation of scaling to the display area
        sprite.scale.set(1, 1);

        // calculate and set the required scale factor
        sprite.scale.x = (Math.min(this.app.view.width, this.app.view.height) * 0.75) / Math.max(sprite.width, sprite.height);
        sprite.scale.y = sprite.scale.x;
    }

    set currentFruit(name) {
        if (name !== this.activeFruitName) {
            let sprite = this.sprites.fruit;

            if (sprite) {
                sprite.texture = PIXI.loader.resources[name].texture;

                this.updateFruitSpriteOrientation(sprite);

                this.activeFruitName = name;
            }
        }
    }

    createFloatingTapValue(value, x, y) {
        // create the floating +counter text
        const tapSprite = new PIXI.Text(`+${this.game.engine.formatNumber(value, 0)}`, new PIXI.TextStyle({
            fontfamily: "Arial",
            fontSize: 60,
            fill: "black"
        }));

        // position it, set its velocity and add it to the stage
        tapSprite.x = x;
        tapSprite.y = y;
        tapSprite.vy = -4;
        tapSprite.vx = 0;
        this.app.stage.addChild(tapSprite);
        this.sprites.taps.push(tapSprite);
    }

    onFruitTapped(e) {
        this.createFloatingTapValue(this.game.juicePerTap, e.data.global.x, e.data.global.y);
        this.game.incrementScore(this.game.juicePerTap);
    }

    onBuyPressed(e) {
        this.game.purchaseAutoClicker();
        this.sprites.buy.text = `Buy 1 AutoClicker\nCost: ${this.game.engine.formatNumber(this.game.producer.calculateCost(1).price)} Juice`;
    }

    onBuyTapPowerPressed(e) {
        this.game.purchaseTapPower();
        this.sprites.buyTapPower.text = `Increase Tap Power\nCost: ${this.game.engine.formatNumber(this.game.calculateTapPowerCost(1))} Juice`;
    }

    onTick(dt) {
        // set the sprite's position
        let sprite = this.sprites.fruit;
        if (sprite) {
            sprite.x = this.app.view.width / 2 - sprite.width / 2;
            sprite.y = this.app.view.height / 2 - sprite.height / 2;
            // update text fields
            this.sprites.score.text = `${this.game.engine.formatNumber(this.game.score, 2)} juice`;
            this.sprites.juiceLeft.text = `${this.game.engine.formatNumber(this.game.juiceToNextLevel, 2)} to next`;
            this.sprites.juiceLeft.position.set(this.app.view.width - this.sprites.juiceLeft.width-10, this.headerHeight + 10);
            this.sprites.buy.position.set(10, this.app.view.height - this.sprites.buy.height - 10);
            this.sprites.buyTapPower.position.set(this.app.view.width - this.sprites.buyTapPower.width - 10, this.app.view.height - this.sprites.buyTapPower.height - 10);
        }

        // update the tap text sprites
        this.sprites.taps = this.sprites.taps.filter((e) => {
            e.y += e.vy;
            e.x += e.vx;
            e.alpha -= 0.02;
            if (e.alpha <= 0) {
                e.destroy();
            }
            return e.alpha > 0;
        });
    }
}