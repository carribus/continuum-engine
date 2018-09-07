import EventEmitter from "./eventemitter.js";

export default class Currency extends EventEmitter {
    constructor(type, initialValue) {
        super();
        this.state = {
            type: type,
            value: initialValue
        }
    }

    get value() {
        return this.state.value;
    }

    get type() {
        return this.state.type;
    }

    set value(v) {
        this.state.value = v;
    }

    serialise() {
        return this.state;
    }

    deserialise(o) {
        this.state = o;
    }

    incrementBy(value) {
        this.value += value;
        this.emit("CURRENCY_UPDATED", {
            obj: this,
            type: this.state.type,
            value: this.state.value,
            delta: value
        });
    }
}