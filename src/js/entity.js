import { EventEmitter } from "./eventemitter.js";

export class Entity extends EventEmitter {
    constructor(type, opts) {
        super();

        this.state = {
            type: type,
            key: opts.key,
            count: opts.count || 0,
            maxCount: opts.maxCount || Number.MAX_VALUE,
        }
        this.lastProcessed = 0;
        this.engine = null;
    }

    get key()               { return this.state.key }
    get count()             { return this.state.count }
    get maxCount()          { return this.state.maxCount }

    serialise() {
        return this.state;
    }

    deserialise(o) {
        this.state = o;
    }

    incrementBy(val) {
        const origValue = this.state.count;
        this.state.count += val;
        if ( this.state.count < 0 ) this.state.count = 0;

        this.emit(this.state.type.toUpperCase() + "_COUNT_UPDATED", {
            obj: this,
            key: this.state.key, 
            count: this.state.count,
            delta: this.state.count-origValue
        });
    }

    onTick(dt) {
        if (this.canProcess(dt)) {
            this.processTick(dt);
            // constraint check
            if (this.count > this.maxCount) this.count = this.maxCount;
            this.lastProcessed = dt;
        }
    }

    processTick(dt) {
        this.count += calculateIncrement(dt);
    }

    canProcess(dt) {
        return this.count > 0;
    }
}