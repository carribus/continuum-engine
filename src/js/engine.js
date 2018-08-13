import { Entity } from "./entity.js";
import { formatScientificNumber } from "./formatters/number_scientific.js";
import { formatDictionaryNumber } from "./formatters/number_dictionary.js";
import { formatAbstractNumber } from "./formatters/number_abstract.js";

export class IncrementalEngine {
    constructor() {
        console.log("IncrementalEngine constructing");
        this.lastTick = 0;
        this.entities = {};
        this.numberFormatter = formatScientificNumber
    }

    createEntity(key, incrementAfter, startingCount, incrementBy, maxCount) {
        if (!this.entities[key]) {
            this.entities[key] = new Entity(key, incrementAfter, startingCount, incrementBy, maxCount);
        }
        return this.entities[key];
    }

    onTick(dt) {
        if (this.lastTick) {
            if (dt - this.lastTick > 50 ) {
                this.processEntities(dt);
                // store the last tick that we did processing on
                this.lastTick = dt;
            }
        } else {
            this.lastTick = dt;
        }
    }

    processEntities(dt) {
        let entity;
        for (let entName in this.entities) {
            entity = this.entities[entName]
            entity.processTick(dt);
        }
    }

    setNumberFormatter(type) {
        if (typeof type == "string") {
            switch (type) {
                case "scientific":
                    this.numberFormatter = formatScientificNumber;
                    break;

                case "dictionary":
                    this.numberFormatter = formatDictionaryNumber;
                    break;

                case "abstract":
                    this.numberFormatter = formatAbstractNumber;

                default:
                    throw `Unknown number formatter (${type}) requested`;
            }
        } else if (typeof type == "function") {
            this.numberFormatter = type;
        } else {
            throw "Unknown number type provided";
        }
    }

    formatNumber(n) {
        return this.numberFormatter(n);
    }
}

