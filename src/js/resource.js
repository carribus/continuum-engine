export class Resource {
    constructor(opts) {
        this.key = opts.key;

        this.basePrice = opts.basePrice;
        this.count = opts.count || 0;

        this.engine = opts.engine;
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