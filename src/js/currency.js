export class Currency {
    constructor(type, initialValue) {
        this.type = type;
        this.value = initialValue;
    }

    serialise() {
        return {
            type: this.type,
            value: this.value
        };
    }

    deserialise(o) {
        this.type = o.type;
        this.value = o.value;
    }

    incrementBy(value) {
        this.value += value;
    }
}