import EventEmitter from "./eventemitter.js";

export default class Reactor extends EventEmitter {
    constructor(opts) {
        super();
        this.state = {
            key: opts.key,
            entityType: opts.entityType,
            entityKey: opts.entityKey,
            basePrice: opts.basePrice,
            count: opts.count || 0,
            maxCount: opts.maxCount || Number.MAX_VALUE
        }
        this.engine = opts.engine;

        // register the event handlers with the entity
        const entity = this.engine[opts.entityType](opts.entityKey);
        if (entity && opts.eventHandlers) {
            opts.eventHandlers.forEach((eh) => {
                entity.on(eh.event, eh.handler.bind(this));
            })
        }
    }

    get key()               { return this.state.key }
    get entityType()        { return this.state.entityType }
    get entityKey()         { return this.state.entityKey }
    get basePrice()         { return this.state.basePrice }
    get count()             { return this.state.count }

    get entity() {
        if (!this.state.entityType || !this.state.entityKey)    throw `Invalid entity configuration in Reactor ${this.state.key}`;
        return this.engine[this.state.entityType+'s'][this.state.entityKey];
    }

    purchase() {
        if (!this.basePrice) return false;

        const currency = this.engine.currency(this.basePrice.currency);
        let result = false;

        if ( currency.value >= this.basePrice.amount ) {
            this.state.count += 1;
            currency.incrementBy(-this.basePrice.amount);
            result = true;
            this.emit("REACTOR_PURCHASED", this);
        }

        return result;
    }
}