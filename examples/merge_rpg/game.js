import ContinuumEngine from "./engine/js/engine.js";
import MergeUI from "./ui.js";
import Weapons from "./weapons.js";

const GAME_CONFIG = {
    grid: {
        width: 5,
        height: 5,
        cellWidth: 128,
        cellHeight: 128
    }
}

export default class Game {
    constructor() {
        this.engine = new ContinuumEngine();
        this.initEngine();

        this.ui = new MergeUI(this, GAME_CONFIG);
        this.ui.init()
            .then(() => {
                // start the game loop (using PIXI's shared ticker)
                this.ticker = PIXI.ticker.shared;
                this.ticker.add(this.onTick, this);
            });

        this.weaponNames = Weapons.map(e => e.name);
        this.currentWeaponIndex = 0;
    }

    get score() {
        return this.engine.currency("gold").value;
    }

    initEngine() {
        this.engine.createCurrency("gold", 0);

        this.engine.createResource({
            key: "weapon",
            count: 0,
            maxCount: GAME_CONFIG.grid.width * GAME_CONFIG.grid.height,
        }).on("RESOURCE_COUNT_UPDATED", this.onWeaponCreated.bind(this));

        this.engine.createProducer({
            key: "weaponspawner",
            count: 1,
            maxCount: 1,
            outputs: {
                resources: {
                    "weapon": {
                        productionTime: 5000,
                        productionAmount: 1
                    }
                }
            }
        })
    }

    onWeaponCreated(e) {
        const [x, y] = [(e.count - 1) % GAME_CONFIG.grid.width, Math.floor((e.count - 1) / GAME_CONFIG.grid.width)]
        console.log('Weapon created: %s, %s', x, y);

        this.engine.createProducer({
            key: `w:${x}:${y}`,
            count: 1,
            maxCount: 1,
            outputs: {
                currencies: {
                    "gold": {
                        productionTime: 1000,
                        productionAmount: this.calculateGoldForWeapon()
                    }
                }
            }
        }).on("PRODUCER_OUTPUT", this.onGoldGenerated.bind(this));
        this.ui.createWeaponSprite(this.weaponNames[this.currentWeaponIndex], x, y);
    }

    onGoldGenerated(e) {
        console.log('Gold generated: ');
        console.log(e);
        let coords = e.producer.key.split(':');
        coords.shift();

        this.ui.createGoldCounter(e.delta, parseInt(coords[0]), parseInt(coords[1]));
    }

    calculateGoldForWeapon() {
        return Math.pow(3, this.currentWeaponIndex);
    }

    onTick(dt) {
        const now = Date.now();
        this.engine.onTick(now);
        this.ui.update(now);
    }
}