import { ContinuumEngine } from "/src/js/engine.js"
import VillageUI from "./ui.js"
import ResourceList from "./resources.js"
import ProducerList from "./producers.js"
import ManagerList from "./managers.js"
import { EventEmitter } from "/src/js/eventemitter.js";

const engine = new ContinuumEngine();
const ui = new VillageUI(engine);
const managers = [];

class Manager extends EventEmitter{
    constructor(opts) {
        super();
        for (const prop in opts) {
            this[prop] = opts[prop];
        }

        const producer = engine.producers[this.producer];
        if ( producer ) {
            producer.on("PRODUCER_OUTPUT", (e) => {
                if (this.count == 0) {
                    console.log('lack of management stops auto processing');
                    producer.processingEnabled = false;
                }
            });
        }
    }

    purchase(currency) {
        let result = false;
        if ( currency.value >= this.basePrice.amount ) {
            this.count = 1;
            currency.incrementBy(-this.basePrice.amount);
            result = true;
            this.emit("MANAGER_PURCHASED", this);
        }

        return result;
    }
}

window.onload = function() {
    engine.createCurrency("gold", 0);

    createResources();
    createProducers();
    createManagers();

    ui.init();

    window.requestAnimationFrame(onTick);
};

function onTick(dt) {
    engine.onTick(Date.now());
    ui.update();
    window.requestAnimationFrame(onTick);        
}

function createResources() {
    for (const res in ResourceList) {
        engine.createResource(ResourceList[res]);
    }
}

function createProducers() {
    for (const prod in ProducerList) {
        const producer = engine.createProducer(ProducerList[prod]);
        
        producer.on("PRODUCER_OUTPUT", (e) => {
            engine.currencies["gold"].incrementBy(e.output.calculatePrice(e.output.count).amount);
            e.output.incrementBy(-e.output.count);
        });
    }
}

function createManagers() {
    for (const mgr in ManagerList) {
        const manager = new Manager(ManagerList[mgr]);

        manager.on("MANAGER_PURCHASED", (e) => {
            const manager = e;
            const producer = engine.producers[manager.producer];

            producer.processingEnabled = true;
        });
        managers.push(manager);
    }
    engine.managers = managers;
}