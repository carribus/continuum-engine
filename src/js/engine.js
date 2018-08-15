import { Entity } from "./entity.js";
import { formatScientificNumber } from "./formatters/number_scientific.js";
import { formatDictionaryNumber } from "./formatters/number_dictionary.js";
import { formatAbstractNumber } from "./formatters/number_abstract.js";
import { Currency } from "./currency.js";

const NUMBER_FORMATTERS = {
    "scientific": formatScientificNumber,
    "dictionary": formatDictionaryNumber,
    "abstract": formatAbstractNumber
};

export class IncrementalEngine {
    constructor() {
        console.log("IncrementalEngine constructing");
        this.lastTick = 0;
        this.entities = {};
        this.numberFormatter = formatDictionaryNumber;
        this.currencies = {};
    }

    createCurrency(type, initialValue) {
        if (!this.currencies[type]) {
            this.currencies[type] = new Currency(type, initialValue);
        }
        return this.currencies[type];
    }

    currency(type) {
        return this.currencies[type];
    }

    createEntity(key, incrementAfter, incrementBy, startingCount, maxCount) {
        if (!this.entities[key]) {
            this.entities[key] = new Entity(key, incrementAfter, incrementBy, startingCount, maxCount);
            this.entities[key].engine = this;
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
            if (!NUMBER_FORMATTERS[type]) throw `Unknown number formatter (${type}) requested`;
            this.numberFormatter = NUMBER_FORMATTERS[type];
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

