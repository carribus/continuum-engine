import EventEmitter from "./engine/js/eventemitter.js";

export const HERO_STATE = Object.freeze({
    IDLE: Symbol("idle"),
    EXPLORING: Symbol("exploring"),
    FIGHTING: Symbol("fighting"),
    RESTING: Symbol("resting")
});

export default class Hero extends EventEmitter {
    constructor(engine) {
        super();
        this.inventory = {};
        this.maxHealth = 20;
        this.health = this.maxHealth;
        this.xp = 0;
        this.xpRequired = this.maxHealth;
        this.level = 1;
        this.atk = 1;
        this.def = 1;
        this.cri = 0.08;
        this.speed = 50;
        this.levelUpParams = {
            healthCoefficient: 1.2
        }

        this.producer = engine.createProducer({
            key: "hero",
            count: 1,
            maxCount: 1,
            baseCost: { currency: "gold", amount: 0 },
            costCoefficient: 1,
            // Do not assign output at creation time - it is assigned dynamically during state change
        });

        this.producer.on("PRODUCER_OUTPUT", this.onProducerOutput.bind(this));

        this.setState(HERO_STATE.IDLE);
    }

    get stats() {
        return {
            atk: this.atk,
            def: this.def,
            cri: this.cri,
            speed: this.speed
        };
    }

    onProducerOutput(e) {
        // console.log(`Hero generated ${e.delta} x ${e.output.key}... (total ${e.output.count})`);
        switch (this.state) {
            case HERO_STATE.IDLE:
                break;

            case HERO_STATE.EXPLORING:
                this.emit("HERO_EXPLORING_CYCLE_ENDED");
                break;

            case HERO_STATE.FIGHTING:
                this.emit("HERO_FIGHTING_CYCLE_ENDED", { damage: e.delta });
                break;

            case HERO_STATE.RESTING:
                this.emit("HERO_RESTING_CYCLE_ENDED", { healing: e.delta });
                break;

            default:
                throw `Unknown hero state ${this.state.toString()}`;
        }
    }

    setState(newState) {
        if (this.state !== newState) {
            this.state = newState;

            this.producer.outputs.resources = {};
    
            switch (newState) {
                case HERO_STATE.IDLE:
                    break;

                case HERO_STATE.EXPLORING:
                    this.producer.addOutput("resource", "exploration", this.speed, 1);
                    break;
    
                case HERO_STATE.FIGHTING:
                    this.producer.addOutput("resource", "hero_damage", this.speed, this.atk);
                    break;
    
                case HERO_STATE.RESTING:
                    this.producer.addOutput("resource", "hero_healing", this.speed, 1);
                    break;
    
                default:
                    throw `Hero state ${newState.toString()} is not a vaid state`;
            }
        }
    }

    calcDamage(dmg) {
        return Math.max(0, dmg - this.def);
    }

    takeDamage(dmg) {
        this.health -= this.calcDamage(dmg);
        this.health = Math.floor(this.health);
    }

    isDead() {
        return this.health <= 0;
    }

    resurrect() {
        if (this.health <= 0) {
            if (this.level > 1) { this.level-- }
            this.xp = 0;
            this.maxHealth = Math.floor(this.maxHealth * 1 / this.levelUpParams.healthCoefficient);
            this.health = this.maxHealth;
            this.atk --;
            this.def = this.def - 1 > 0 ? this.def-1 : 1;
            this.xpRequired = this.maxHealth;
        }
    }

    levelUp() {
        this.level++;
        this.maxHealth = Math.floor(this.maxHealth * this.levelUpParams.healthCoefficient);
        this.health = this.maxHealth;
        this.atk ++;
        this.def += this.level % 5 == 0 ? 1 : 0;
        this.xp = 0;
        this.xpRequired += this.maxHealth;
    }

    addItemToInventory(item) {
        this.inventory[item] = this.inventory[item] || 0;
        this.inventory[item]++;
    }

    removeItemFromInventory(item) {
        if (this.inventory[item]) {
            this.inventory[item]--;
        }
    }
}