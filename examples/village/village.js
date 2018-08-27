import { ContinuumEngine } from "/src/js/engine.js"
import VillageUI from "./ui.js"
import ResourceList from "./resources.js"
import ProducerList from "./producers.js"

const engine = new ContinuumEngine();
const ui = new VillageUI(engine);

window.onload = function() {
    engine.createCurrency("gold", 0);
    for (const res in ResourceList) {
        engine.createResource(ResourceList[res]);
    }
    for (const prod in ProducerList) {
        const producer = engine.createProducer(ProducerList[prod]);
        
        producer.on("PRODUCER_COUNT_UPDATED", (e) => {
            if (e.obj.count >= 25) {
                e.obj.processingEnabled = true;
            }
        });
        producer.on("PRODUCER_OUTPUT", (e) => {
            engine.currencies["gold"].incrementBy(e.output.calculatePrice(e.output.count).amount);
            e.output.incrementBy(-e.output.count);
        });
    }

    ui.init();

    window.requestAnimationFrame(onTick);
};

function onTick(dt) {
    engine.onTick(Date.now());
    ui.update();
    window.requestAnimationFrame(onTick);        
}
