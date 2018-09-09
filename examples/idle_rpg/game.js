import ContinuumEngine from "./engine/js/engine.js"
import ConsoleLogger from "./console_logger.js";
import Hero, { HERO_STATE } from "./hero.js";
import ResourceList from "./resources.js";
import Enemy, { ENEMY_STATE } from "./enemy.js";
import LootTable from "./loottable.js";

const DISCOVERY_ITEM_TABLE = {
    BERSERKER_PLANT: { label: "Berseker Plant", type: Symbol("berserker"), probability: 2 },
    XP_LEAF: { label: "Experience Leaf", type: Symbol("xpleaf"), probability: 5 },
    IRON_SHROOM: { label: "Iron Mushroom", type: Symbol("ironshroom"), probability: 2 },
    EAGLEEYE_SEED: { label: "Eagle Eye Seed", type: Symbol("eagleeye"), probability: 1 },
    NOTHING: { label: "nothing", type: Symbol("nothing"), probability: 70 },
}

export default class Game {
    constructor() {
        this.heroElement = document.getElementById('hero');
        this.statsElement = document.getElementById('stats');
        this.rootElement = document.getElementById('game');
        this.engine = new ContinuumEngine();
        this.stats = {
            "Deaths": 0,
            "DMG Dealt": 0,
            "DMG Taken": 0,
            "Kills": 0,
            "Total XP": 0,
            "Items Found": 0,
        }
        this.createStatsElements(this.statsElement);

        this.enemy = null;

        this.gameStateTable = new LootTable([
            { type: "encounter", probability: 3 },
            { type: "discover", probability: 15 },
            { type: "noAction", probability: 90 },
        ]);

        // create the hero
        this.hero = new Hero(this.engine);
        this.logger = new ConsoleLogger(this.rootElement, this.hero);
        this.logger.consoleEnabled = false;

        this.hero.on("HERO_EXPLORING_CYCLE_ENDED", this.onHeroExploringCycleEnded.bind(this));
        this.hero.on("HERO_FIGHTING_CYCLE_ENDED", this.onHeroFightingCycleEnded.bind(this));
        this.hero.on("HERO_RESTING_CYCLE_ENDED", this.onHeroRestingCycleEnded.bind(this));

        this.hero.setState(HERO_STATE.EXPLORING);
        this.logger.log("hero", "Hero starts exploring...");

        this.createHeroElements(this.heroElement);

        // create the resources (outputs of the hero and enemy producers)
        for (const res in ResourceList) {
            this.engine.createResource(ResourceList[res]);
        }

        // create the discovery loot table
        this.discoveryLootTable = new LootTable(Object.values(DISCOVERY_ITEM_TABLE));
    }

    createHeroElements(parent) {
        const stats = this.hero.stats;
        for (const key in stats) {
            const e = document.createElement('div');
            e.className = 'herostat';
            e.dataset.statName = key;
            parent.appendChild(e);
        }
    }

    createStatsElements(parent) {
        for (const key in this.stats) {
            const e = document.createElement('div');
            e.className = 'stat';
            e.dataset.statName = key;

            parent.appendChild(e);
        }
    }

    onHeroExploringCycleEnded(e) {
        const nextState = this.gameStateTable.getRandomItem();
        switch (nextState.type) {
            case "encounter":
                this.spawnEnemy();
                this.hero.setState(HERO_STATE.FIGHTING);
                this.logger.log("warning", `Hero encounters an enemy: ${this.enemy.name} with ${this.enemy.health} HP`);
                break;

            case "discover":
                const loot = this.discoveryLootTable.getRandomItem();
                if ( loot.type != DISCOVERY_ITEM_TABLE.NOTHING.type ) {
                    this.stats["Items Found"]++;
                }
                this.increaseHeroXP(1);
                this.logger.log("hero", `Hero discovered ${loot.label} while exploring...`);
                switch (loot.type) {
                    case    DISCOVERY_ITEM_TABLE.XP_LEAF.type:
                        this.increaseHeroXP(this.hero.level * 3);
                        break;

                    case    DISCOVERY_ITEM_TABLE.NOTHING.type:
                        // do nothing... nada... zilch!
                        break;

                    case    DISCOVERY_ITEM_TABLE.BERSERKER_PLANT.type:
                        this.hero.atk ++;
                        break;

                    case    DISCOVERY_ITEM_TABLE.IRON_SHROOM.type:
                        this.hero.def++;
                        break;

                    case    DISCOVERY_ITEM_TABLE.EAGLEEYE_SEED.type:
                        this.hero.cri += 0.02;
                        break;

                    default:
                        
                        break;
                }
                break;

            case "noAction":
                break;

            default:
                debugger;
                throw "Unknown action occurred on hero!";
        }
    }

    onHeroFightingCycleEnded(e) {
        const critical = (Math.random() <= this.hero.cri ? 2 : 1);
        e.damage *= critical;
        this.logger.log("hero", `Hero ${critical == 2 ? "criticals" : "attacks"} ${this.enemy.name} for ${this.enemy.calcDamage(e.damage)} damage`)
        this.stats["DMG Dealt"] += this.enemy.calcDamage(e.damage);
        this.enemy.takeDamage(e.damage);
        if (this.enemy.isDead()) {
            this.logger.log("notice", `Hero has killed ${this.enemy.name} and gains ${this.enemy.xpValue} XP`);
            this.increaseHeroXP(this.enemy.xpValue);
            this.enemy = null;
            this.stats.Kills ++;

            if (this.hero.health < this.hero.maxHealth) {
                this.hero.setState(HERO_STATE.RESTING);
                this.logger.log("hero", "Hero rests for a while");
            } else {
                this.hero.setState(HERO_STATE.EXPLORING);
                this.logger.log("hero", "Hero goes back to exploring");
            }
        }
    }

    onHeroRestingCycleEnded(e) {
        this.hero.health += e.healing;
        if ( this.hero.health > this.hero.maxHealth ) {
            this.hero.health = this.hero.maxHealth;
        } 
        this.logger.log("hero", "Hero recovers some health...");

        if (this.hero.health === this.hero.maxHealth) {
            this.hero.setState(HERO_STATE.EXPLORING);
            this.logger.log("hero", "Hero goes back to exploring");
        }
    }

    onTick(dt) {
        if (!this.hero.isDead()) {
            const now = Date.now();
            this.engine.onTick(now);
        }

        // update hero stats
        const herostats = this.hero.stats;
        this.heroElement.childNodes.forEach((child) => {
            const key = child.dataset.statName;
            child.innerHTML = `${key}: ${this.engine.formatNumber(herostats[key])}`;
        });
        // update stats
        this.statsElement.childNodes.forEach((child) => {
            const key = child.dataset.statName;
            child.innerHTML = `${key}: ${this.engine.formatNumber(this.stats[key])}`;
        });
    }

    increaseHeroXP(byVal) {
        this.hero.xp += byVal;
        this.stats["Total XP"] += byVal;
        // check if the hero can level up
        if (this.hero.xp >= this.hero.xpRequired) {
            this.hero.levelUp();
            this.logger.log("info", "Hero has levelled up!")
        }
    }

    spawnEnemy() {
        this.enemy = new Enemy(this.engine);
        this.enemy.name = "Random Monster";
        this.enemy.level = this.hero.level;
        this.enemy.health = Math.floor(this.hero.maxHealth * (1 + Math.random() * 0.5));
        this.enemy.atk = this.hero.atk;
        this.enemy.def = this.hero.def-1 + Math.floor(Math.random() * this.enemy.level);
        this.enemy.cri = this.hero.cri;
        this.enemy.speed = this.hero.speed;
        this.enemy.xpValue = Math.max(1, Math.floor(this.enemy.level/2));

        this.enemy.on("ENEMY_DAMAGE", this.onEnemyDamage.bind(this));

        this.enemy.setState(ENEMY_STATE.FIGHTING);
    }

    onEnemyDamage(e) {
        const critical = Math.random <= e.enemy.cri ? 2 : 1;
        e.damage *= critical;
        this.logger.log("enemy", `${e.enemy.name} ${critical == 1 ? "hits" : "criticals"} hero for ${this.hero.calcDamage(e.damage)} damage`);
        this.stats["DMG Taken"] += this.hero.calcDamage(e.damage);
        this.hero.takeDamage(e.damage);
        if (this.hero.isDead()) {
            this.logger.log("notice", "Hero has died!");
            this.stats.deaths++;
            this.hero.resurrect();
        } else if (this.hero.health <= e.damage) {
            this.logger.log("notice", "Hero flees for his life...");
            this.hero.xp -= this.enemy.xpValue;
            this.hero.xp = Math.max(0, this.hero.xp);
            this.engine.destroyProducer("enemy");
            this.enemy = null;

            this.hero.setState(HERO_STATE.RESTING);
            this.logger.log("hero", "Hero rests for a while");
        }
    }

}