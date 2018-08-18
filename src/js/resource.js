export class Resource {
    constructor(opts) {
        this.key = opts.key;

        this.basePrice = opts.basePrice;
        this.count = opts.count || 0;

        this.engine = opts.engine;
    }

    serialise() {
        return {
            key: this.key,
            basePrice: this.basePrice,
            count: this.count
        };
    }

    deserialise(o) {
        this.key = o.key;
        this.basePrice = o.basePrice;
        this.count = o.count;
    }

    incrementBy(val) {
        this.count += val;
    }

    calculatePrice(amountToSell) {
        amountToSell = amountToSell || this.count;
        return { currency: this.basePrice.currency, amount: amountToSell * this.basePrice.amount };
    }

    processTick(dt) {
        // no implementation yet..
    }
}