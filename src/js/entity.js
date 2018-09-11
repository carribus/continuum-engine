import EventEmitter from "./eventemitter.js";

export default class Entity extends EventEmitter {
    constructor(type, opts) {
        super();

        this.state = {
            type: type,
            key: opts.key,
            count: opts.count || 0,
            maxCount: opts.maxCount || Number.MAX_VALUE,
        }
        this.requirements = opts.requirements;
        if ( this.requirements ) console.log(this.requirements);
        this.lastProcessed = 0;
        this.engine = opts.engine;
    }

    get type()              { return this.state.type }
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
        let diff = 0;
        this.state.count = Math.min(this.state.count + val, this.state.maxCount);
        if ( this.state.count < 0 ) this.state.count = 0;

        diff = this.state.count - origValue;

        if (diff !== 0) {
            this.emit(this.state.type.toUpperCase() + "_COUNT_UPDATED", {
                obj: this,
                key: this.state.key,
                count: this.state.count,
                delta: diff
            });
        }

        return diff
    }

    requirementsMet() {
        if (this.requirements) {
            for (const cat in this.requirements) {
                for (const key in this.requirements[cat]) {
                    if ( this.engine[cat] && this.engine[cat][key] ) {
                        if ( this.engine[cat][key].count < this.requirements[cat][key] )
                        return false;
                    }
                }
            }
        }
        return true;
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