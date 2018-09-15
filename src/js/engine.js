import formatScientificNumber from "./formatters/number_scientific.js";
import formatDictionaryNumber from "./formatters/number_dictionary.js";
import formatAbstractNumber from "./formatters/number_abstract.js";
import Currency from "./currency.js";
import Producer from "./producer.js";
import Resource from "./resource.js";
import Modifier from "./modifier.js";
import Reactor from "./reactor.js";

const NUMBER_FORMATTERS = {
    "scientific": formatScientificNumber,
    "dictionary": formatDictionaryNumber,
    "abstract": formatAbstractNumber
};

export default class ContinuumEngine {
    constructor() {
        this.lastTick = 0;
        this.lastSave = 0;
        this.currencies = {};
        this.producers = {};
        this.resources = {};
        this.modifiers = {};
        this.reactors = {};
        this.activeModifiers = [];
        this.numberFormatter = formatDictionaryNumber;
        this.autosavePeriod = 0;
        console.log("%c %c Continuum Engine ready", "font-size: 12px;background: blue; color: white", "font-size: 12px; background: white; color: black;");
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
        if ( !opts.key ) throw `Invalid producer .key value provided ${opts.type}`;
        if (!this.producers[opts.key]) {
            opts.engine = this;
            this.producers[opts.key] = new Producer(opts);
        }
        return this.producers[opts.key];
    }

    destroyProducer(key) {
        if (this.producers[key]) {
            delete this.producers[key];
        }
    }

    producer(key) {
        return this.producers[key];
    }

    createResource(opts) {
        if ( !opts ) throw "No resource options provided";
        if ( !opts.key ) throw `Invalid resource .key value provided ${opts.key}`;
        if (!this.resources[opts.key]) {
            opts.engine = this;
            this.resources[opts.key] = new Resource(opts);
        }
        return this.resources[opts.key];
    }

    resource(key) {
        return this.resources[key];
    }

    createModifier(opts) {
        if (!opts) throw "No modifier options provided";
        if (!opts.key) throw `Invalid modifier .key value provided ${opts.key}`;
        if (!this.modifiers[opts.key]) {
            opts.engine = this;
            this.modifiers[opts.key] = new Modifier(opts);
        }
        return this.modifiers[opts.key];
    }

    modifier(key) {
        return this.modifiers[key];
    }

    createReactor(opts) {
        if (!opts) throw "No reactor options provided";
        if (!opts.key) throw `Invalid reactor .key value provided ${opts.key}`;
        if (!this.reactors[opts.key]) {
            opts.engine = this;
            this.reactors[opts.key] = new Reactor(opts);
        }
        return this.reactors[opts.key];
    }

    reactor(key) {
        return this.reactors[key];
    }

    activateModifier(key, opts) {
        if (this.modifiers[key]) {
            if ( !this.modifiers[key].applyFunc ) return;
            const modifier = {
                key: key,
                expiresAt: opts.timeLeft ? Date.now() + opts.timeLeft : null,
            }
            // apply the modifier
            for (const producer in this.producers) {
                this.modifiers[key].apply("producer", this.producers[producer]);
            }
            for (const resource in this.resources) {
                this.modifiers[key].apply("resource", this.resources[resource]);
            }

            // store the modifier in the active modifiers array
            this.activeModifiers.push(modifier);
        } else {
            console.error(`Modifier ${key} not found and cannot be activated`);
        }
    }

    onTick(dt) {
        if (this.lastTick) {
            if (dt - this.lastTick > 50 ) {
                this.processProducers(dt);
                this.processResources(dt);
                this.processModifiers(dt);
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

        if (this.lastSave) {
            if (dt - this.lastSave > this.autosavePeriod) {
                this.saveState();
                this.lastSave = dt;
            }
        } else {
            this.lastSave = dt;
        }
    }

    saveState() {
        const serialiseObject = (o) => {
            const result = {};
            for (const prop in o) {
                result[prop] = o[prop].serialise();
            }
            return result;
        }

        const state = {
            lastTick: 0, //this.lastTick,
            lastSave: 0, //this.lastSave,
            currencies: serialiseObject(this.currencies),
            producers: serialiseObject(this.producers),
            resources: serialiseObject(this.resources),
            reactors: serialiseObject(this.reactors),
            numberFormatter: this.numberFormatter,
            autosavePeriod: this.autosavePeriod
        }
        window.localStorage.setItem('state', JSON.stringify(state));
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
            producer.onTick(dt);
        }
    }

    processResources(dt) {
        let resource;
        for (const key in this.resources) {
            resource = this.resources[key];
            resource.onTick(dt);
        }
    }

    processModifiers(dt) {
        let modifier;
        for ( let i = this.activeModifiers.length-1; i >= 0; i-- ) {
            modifier = this.activeModifiers[i];
            if (modifier.expiresAt < Date.now()) {
                // deactivate the modifier
                for (const producer in this.producers) {
                    this.modifiers[modifier.key].remove("producer", this.producers[producer]);
                }
                for (const resource in this.resources) {
                    this.modifiers[modifier.key].remove("resource", this.resources[resource]);
                }
                // remove the modifier from the active modifiers list
                this.activeModifiers.splice(i, 1);
            }
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

    formatNumber(n, decimals = 2) {
        return this.numberFormatter(n, decimals);
    }
}

