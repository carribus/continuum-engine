import { Entity } from "./entity.js";
import { formatScientificNumber } from "./formatters/number_scientific.js";
import { formatDictionaryNumber } from "./formatters/number_dictionary.js";
import { formatAbstractNumber } from "./formatters/number_abstract.js";
import { Currency } from "./currency.js";
import { Producer } from "./producer.js";
import { Resource } from "./resource.js";

const NUMBER_FORMATTERS = {
    "scientific": formatScientificNumber,
    "dictionary": formatDictionaryNumber,
    "abstract": formatAbstractNumber
};

export class IncrementalEngine {
    constructor() {
        console.log("IncrementalEngine constructing");
        this.lastTick = 0;
        this.lastSave = 0;
        this.currencies = {};
        this.producers = {};
        this.resources = {};
        this.entities = {};
        this.numberFormatter = formatDictionaryNumber;
        this.autosavePeriod = 0;
    }

    createCurrency(type, initialValue) {
        if ( !type ) throw `Invalid currency type value provided ${type}`;
        if (!this.currencies[type]) {
            this.currencies[type] = new Currency(type, initialValue);
        }
        return this.currencies[type];
    }

    currency(type) {
        return this.currencies[type];
    }

    createProducer(opts) {
        if ( !opts ) throw "No producer options provided";
        if ( !opts.key ) throw `Invalid producer type value provided ${opts.type}`;
        if (!this.producers[opts.key]) {
            opts.engine = this;
            this.producers[opts.key] = new Producer(opts);
        }
        return this.producers[opts.key];
    }

    createResource(opts) {
        if ( !opts ) throw "No resource options provided";
        if ( !opts.key ) throw `Invalid resource type value provided ${opts.key}`;
        if (!this.resources[opts.key]) {
            opts.engine = this;
            this.resources[opts.key] = new Resource(opts);
        }
        return this.resources[opts.key];
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
                this.processProducers(dt);
                this.processResources(dt);
                this.processEntities(dt);
                // store the last tick that we did processing on
                this.lastTick = dt;
            }
        } else {
            this.lastTick = dt;
        }
        this.autoSave(dt);
    }

    autoSave(dt) {
        if (!this.autosavePeriod) return;

        const serialiseObject = (o) => {
            const result = {};
            for (const prop in o) {
                result[prop] = o[prop].serialise();
            }
            return result;
        }

        if (this.lastSave) {
            if (dt - this.lastSave > this.autosavePeriod) {
                // console.log('Auto-save...');
                const state = {
                    lastTick: 0, //this.lastTick,
                    lastSave: 0, //this.lastSave,
                    currencies: serialiseObject(this.currencies),
                    producers: serialiseObject(this.producers),
                    resources: serialiseObject(this.resources),
                    numberFormatter: this.numberFormatter,
                    autosavePeriod: this.autosavePeriod
                }
                window.localStorage.setItem('state', JSON.stringify(state));
                this.lastSave = dt;
            }
        } else {
            this.lastSave = dt;
        }
    }

    loadState() {
        let state = window.localStorage.getItem('state');

        if (state) {
            try {
                state = JSON.parse(state);
                for (const prop in state) {
                    switch (prop) {
                        case "currencies":
                            for (const curr in state[prop]) {
                                this.currencies[curr].deserialise(state[prop][curr]);
                            }
                            break;

                        case "resources":
                            for (const res in state[prop]) {
                                this.resources[res].deserialise(state[prop][res]);
                            }
                            break;

                        case "producers":
                            for (const prod in state[prop]) {
                                this.producers[prod].deserialise(state[prop][prod]);
                            }
                            break;

                        default:
                            this[prop] = state[prop];
                            break;
                    }
                }
            } catch (e) {
                throw e;
            }
        }
    }

    processProducers(dt) {
        let producer;
        for (const key in this.producers) {
            producer = this.producers[key];
            producer.processTick(dt);
        }
    }

    processResources(dt) {
        let resource;
        for (const key in this.resources) {
            resource = this.resources[key];
            resource.processTick(dt);
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

