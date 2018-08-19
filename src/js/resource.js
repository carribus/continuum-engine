export class Resource {
    constructor(opts) {
        this.state = {
            key: opts.key,
            basePrice: opts.basePrice,
            count: opts.count || 0,
        };

        this.calculated = opts.calculated;
        this.engine = opts.engine;
    }

    serialise() {
        return this.state;
    }

    deserialise(o) {
        this.state = o;
    }

    get key() {
        return this.state.key;
    }

    get basePrice() {
        return this.state.basePrice;
    }

    get count() {
        return this.state.count;
    }

    incrementBy(val) {
        this.state.count += val;
        if ( this.state.count < 0 ) this.state.count = 0;
    }

    calculatePrice(amountToSell) {
        if (this.state.basePrice) {
            amountToSell = amountToSell || this.state.count;
            return { currency: this.state.basePrice.currency, amount: amountToSell * this.state.basePrice.amount };
        }
        return 0;
    }

    processTick(dt) {
        if (this.calculated && typeof this.calculated === "object") {
            let obj;
            const source = this.calculated.source;
            
            switch (source.type) {
                case "resource":
                    obj = this.engine.resources[source.key];
                    break;

                case "producer":
                    obj = this.engine.producers[source.key];
                    this.state.count = this.calculated.calcFunc(obj);
                    break;

                default:
                    break;
            }
            if (obj) {
                this.state.count = this.calculated.calcFunc(obj);
            }
        }
    }
}