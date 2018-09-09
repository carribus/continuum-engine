import EventEmitter from "./engine/js/eventemitter.js";

export const ENEMY_STATE = Object.freeze({
    IDLE: Symbol("idle"),
    FIGHTING: Symbol("fighting"),
    DEAD: Symbol("dead")
});

export default class Enemy extends EventEmitter {
    constructor(engine) {
        super();
        this.name = name;
        this.level = 1;
        this.health = 20;
        this.atk = 1;
        this.def = 1;
        this.cri = 0.1;
        this.speed = 250;
        this.xpValue = 0;

        this.producer = engine.createProducer({
            key: "enemy",
            count: 1,
            maxCount: 1,
            baseCost: { currency: "gold", amount: 0 },
            costCoefficient: 1,
        });

        this.producer.on("PRODUCER_OUTPUT", (e) => {
            this.emit("ENEMY_DAMAGE", { enemy: this, damage: e.delta });
        });

        this.setState(ENEMY_STATE.IDLE);
    }

    setState(newState) {
        if (this.state !== newState) {
            this.state = newState;

            this.producer.outputs.resource = {};

            switch (newState) {
                case ENEMY_STATE.IDLE:
                    break;

                case ENEMY_STATE.FIGHTING:
                    this.producer.addOutput("resource", "enemy_damage", this.speed, this.atk);
                    break;

                case ENEMY_STATE.DEAD:
                    this.producer.engine.destroyProducer("enemy");
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
        if (this.health <= 0) {
            this.setState(ENEMY_STATE.DEAD);
        }
    }

    isDead() {
        return this.health <= 0;
    }
}