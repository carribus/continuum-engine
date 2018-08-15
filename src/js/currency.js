export class Currency {
    constructor(type, initialValue) {
        this.type = type;
        this.value = initialValue;
    }

    incrementBy(value) {
        this.value += value;
    }
}