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
        engine.createProducer(ProducerList[prod]);
    }

    ui.init();

    window.requestAnimationFrame(onTick);
};

function onTick(dt) {
    engine.onTick(Date.now());
    ui.update();
    window.requestAnimationFrame(onTick);        
}
