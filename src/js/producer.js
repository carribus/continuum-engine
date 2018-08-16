export class Producer {
    constructor(opts) {
        this.key = opts.key;
        this.inputs = opts.inputs || {};
        this.outputs = opts.outputs || { resources: {}, producers: {} };

        this.baseCost = opts.baseCost;
        this.costCoefficient = opts.costCoefficient || 1;
        this.count = opts.count || 0;
        this.maxCount = opts.maxCount || Number.MAX_VALUE;

        this.engine = opts.engine;
    }

    addOutputResource(key, productionTime, productionAmount) {
        if (!this.outputs.resources) {
            this.outputs.resources = {};
        }
        if (this.outputs.resources && !this.outputs.resources[key]) {
            this.output.resources[key] = {
                productionTime,
                productionAmount
            };
        }
        return this;
    }

    addOutputProducer(key, productionTime, productionAmount) {
        if (!this.outputs.producers) {
            this.outputs.producers = {};
        }
        if (!this.output.producers[key]) {
            this.output.producers[key] = {
                productionTime,
                productionAmount
            };
        }
        return this;
    }

    setCustomProcessor(processFunc) {
        if (processFunc === null || processFunc && typeof processFunc == "function") {
            this.customProcessor = processFunc;
        }
        return this;
    }

    calculateCost(count) {
        let cost = 0;

        for (let i = 0; i < count; i++) {
            cost += Math.round(this.baseCost.amount * Math.pow(this.costCoefficient, this.count+i));
        }
        return cost;
    }

    processTick(dt) {
        let lastProcessed, outputRules, outputObj;

        if (this.count > 0) {
            // loop through the output categories
            for (const outputCategory in this.outputs) {
                for (const outputKey in this.outputs[outputCategory]) {
                    outputRules = this.outputs[outputCategory][outputKey];
                    lastProcessed = outputRules.lastProcessed || 0;

                    outputObj = this.engine[outputCategory][outputKey];
                    if (outputObj) {
                        if (outputRules.productionTime > 0 && dt - lastProcessed >= outputRules.productionTime) {
                            let incrementBy = (this.count * outputRules.productionAmount * Math.trunc((dt-lastProcessed)/outputRules.productionTime));
                            outputObj.incrementBy(incrementBy);
        
                            // constraint check
                            if (this.count > this.maxCount) this.count = this.maxCount;
                            outputRules.lastProcessed = dt;
                        }
                    } else {
                        throw `Output object not found:\n\tType: ${outputCategory}\n\tKey: ${outputKey}`
                    }

                }
            }
        }
    }
}