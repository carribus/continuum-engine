import { Entity } from "./entity.js";

export class Producer extends Entity {
    constructor(opts) {
        super("producer", opts);
        this.state.baseCost = opts.baseCost;
        this.state.costCoefficient = opts.costCoefficient;
        this.state.consumedInputs = {};
        this.inputs = opts.inputs || {};
        this.outputs = opts.outputs || { resources: {}, producers: {} };
        this.postProcessors = opts.postProcessors;

        this.engine = opts.engine;
    }

    get baseCost() {
        return this.state.baseCost;
    }

    get costCoefficient() {
        return this.state.costCoefficient;
    }

    get consumedInputs() {
        return this.state.consumedInputs;
    }

    calculateCost(count) {
        let cost = 0;

        for (let i = 0; i < count; i++) {
            cost += Math.round(this.state.baseCost.amount * Math.pow(this.state.costCoefficient, this.state.count+i));
        }
        return cost;
    }

    processTick(dt) {
        let lastProcessed, rules, obj;
        const result = this.state.consumedInputs;

        const processInputs = () => {
            // loop through the input categories
            Object.keys(this.inputs).map((cat) => {
                Object.keys(this.inputs[cat]).map((input) => {
                    rules = this.inputs[cat][input];
                    lastProcessed = rules.lastProcessed;
                    obj = this.engine[cat][input];
                    
                    if (lastProcessed) {
                        if (obj) {
                            if (rules.consumptionTime > 0 && dt - lastProcessed >= rules.consumptionTime) {
                                let consumeBy = Math.min(obj.count, (this.state.count * rules.consumptionAmount * Math.trunc((dt-lastProcessed)/rules.consumptionTime)));

                                obj.incrementBy(-consumeBy);
                                if (consumeBy) {
                                    result[cat] = result[cat] || {};
                                    result[cat][input] = result[cat][input] || { amount: 0 };
                                    result[cat][input].amount += consumeBy;
                                }
                                rules.lastProcessed = dt;
                            }
                        } else {
                            throw `Input object not found:\n\tType: ${cat}\n\tKey: ${input}`
                        }
                    } else {
                        rules.lastProcessed = dt;
                    }
                });
            });
        }

        const processOutputs = () => {
            const inputRequirementsMet = (reqs) => {
                if (!reqs) return true;

                for (const rc of reqs) {
                    if ( this.state.consumedInputs[rc.category] && this.state.consumedInputs[rc.category][rc.type] ) {
                        if (this.state.consumedInputs[rc.category][rc.type].amount < rc.amount) {
                            return false;
                        }
                    } else {
                        return false;
                    }
                }
                return true;
            };

            const clampByConsumedInputs = (count, reqs) => {
                if (!reqs) return count;

                for (const rc of reqs) {
                    let maxConsumable = Math.min(count*rc.amount, this.state.consumedInputs[rc.category][rc.type].amount);
                    if ( maxConsumable >= rc.amount ) {
                        count = Math.min(count, maxConsumable/rc.amount);
                    }
                }

                return count;
            }

            const reduceConsumpedInputsBy = (count, reqs) => {
                if (!reqs) return;

                for (const rc of reqs) {
                    this.state.consumedInputs[rc.category][rc.type].amount -= count*rc.amount;
                }
            }

            if ( this.state.count > 0 ) {
                Object.keys(this.outputs).map((cat) => {
                    Object.keys(this.outputs[cat]).map((output) => {
                        rules = this.outputs[cat][output];
                        lastProcessed = rules.lastProcessed;
                        obj = this.engine[cat][output];

                        if (lastProcessed) {
                            if (obj) {
                                if (rules.productionTime > 0 && dt - lastProcessed >= rules.productionTime) {
                                    if (inputRequirementsMet(rules.inputRequirements)) {
                                        // calculate the number of times this calculation "should" have executed since the last execution
                                        let timeMultiple = Math.trunc((dt-lastProcessed)/rules.productionTime);
                                        // clamp to the minimum possible consumable inputs
                                        let clampedCount = clampByConsumedInputs(this.state.count*timeMultiple, rules.inputRequirements);
                                        const incrementBy = clampedCount * rules.productionAmount;
    
                                        reduceConsumpedInputsBy(clampedCount, rules.inputRequirements);
                                        obj.incrementBy(incrementBy);
                    
                                        rules.lastProcessed = dt;
                                    };
                                }
                            } else {
                                throw `Output object not found:\n\tType: ${cat}\n\tKey: ${input}`
                            }
                        } else {
                            rules.lastProcessed = dt;
                        }
                    });
                });
            }
        }

        const runPostProcessors = () => {
            if (this.postProcessors) {
                Object.keys(this.postProcessors).forEach((pp) => {
                    const stack = this.postProcessors[pp].stack || null;
                    if (this.postProcessors[pp].func) {
                        this.postProcessors[pp].func(this, stack);
                    }
                });
            }
        }

        processInputs();
        processOutputs();
        runPostProcessors();
    }
}