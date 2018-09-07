import Entity from "./entity.js";

export default class Resource extends Entity {
    constructor(opts) {
        super("resource", opts);
        this.state.basePrice = opts.basePrice;

        this.calculated = opts.calculated;
    }

    get basePrice() {
        return this.state.basePrice;
    }

    calculatePrice(amountToSell) {
        if (this.state.basePrice) {
            amountToSell = amountToSell || this.state.count;
            return { currency: this.state.basePrice.currency, amount: amountToSell * this.state.basePrice.amount };
        }
        return null;
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