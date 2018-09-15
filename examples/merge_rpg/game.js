import ContinuumEngine from "./engine/js/engine.js";
import MergeUI from "./ui.js";
import Weapons from "./weapons.js";

const GAME_CONFIG = {
    grid: {
        width: 5,
        height: 5,
        cellWidth: 164,
        cellHeight: 164
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
                        productionTime: 3000,
                        productionAmount: 1
                    }
                }
            }
        })
    }

    onWeaponCreated(e) {
        if (e.delta > 0) {
            // TODO: Change this to find the next available cell coords
            const cell = this.ui.findFirstEmptyCell();
            console.log('Weapon created:');

            if (cell !== -1) {
                const prod = this.engine.createProducer({
                    key: `w:${Date.now()}`,
                    count: 1,
                    maxCount: 1,
                    outputs: {
                        currencies: {
                            "gold": {
                                productionTime: 1000,
                                productionAmount: this.calculateGoldForWeapon(this.currentWeaponIndex)
                            }
                        }
                    }
                });
                prod.on("PRODUCER_OUTPUT", this.onGoldGenerated.bind(this));
                // prod.sprite = this.ui.createWeaponSprite(prod, this.currentWeaponIndex, this.weaponNames[this.currentWeaponIndex], cell % GAME_CONFIG.grid.width, Math.floor(cell / GAME_CONFIG.grid.width));
                prod.sprite = this.ui.createWeaponSprite(prod, this.currentWeaponIndex, cell % GAME_CONFIG.grid.width, Math.floor(cell / GAME_CONFIG.grid.width));
            }
        }
    }

    onGoldGenerated(e) {
        // console.log('Gold generated: ');
        // console.log(e);
        let coords = e.producer.key.split(':');
        coords.shift();

        this.ui.createGoldCounter(e.producer, e.delta);
    }

    mergeWeapons(from, into) {
        if (from.level === into.level) {
            into.level++;
            into.producer.outputs.currencies.gold.productionAmount = this.calculateGoldForWeapon(into.level);
            this.engine.destroyProducer(from.producer.key);
            this.engine.resource('weapon').incrementBy(-1);
        }
    }

    calculateGoldForWeapon(level) {
        return Math.pow(3, level);
    }

    onTick(dt) {
        const now = Date.now();
        this.engine.onTick(now);
        this.ui.update(now);
    }
}