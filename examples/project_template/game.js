import ContinuumEngine from "./engine/js/engine.js";
import UI from "./ui.js";

export default class Game {
    constructor() {
        this.engine = new ContinuumEngine();
        this.initEngine();

        this.ui = new UI(this);
    }

    initEngine() {
        // create Producers, Resources, modifiers, reactors etc 
        this.engine.createCurrency("dots", 0);
        this.engine.createProducer({
            key: "dotmaker",
            count: 1,
            outputs: {
                currencies: {
                    "dots": {
                        productionTime: 500,
                        productionAmount: 1
                    }
                }
            }
        });
        this.engine.producer("dotmaker").on("PRODUCER_OUTPUT", (e) => {
            this.ui.addDot(e);
        })
    }

    onTick(dt) {
        this.engine.onTick(dt);
        this.ui.update(dt);
    }
}