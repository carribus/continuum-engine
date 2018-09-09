import ContinuumEngine from "/src/js/engine.js"
import VillageUI from "./ui.js"
import ResourceList from "./resources.js"
import ProducerList from "./producers.js"
import ManagerList from "./managers.js"
import MilestoneList from "./milestones.js"

const engine = new ContinuumEngine();
const ui = new VillageUI(engine);

window.onload = function() {
    engine.createCurrency("gold", 0);

    createResources();
    createProducers();
    createManagers();
    createMilestoneRactors();

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
        const manager = engine.createReactor(ManagerList[mgr]);

        manager.on("REACTOR_PURCHASED", (e) => {
            const manager = e;
            manager.entity.processingEnabled = true;
        });
    }
}

function createMilestoneRactors() {
    for (const ms in MilestoneList) {
        const reactor = engine.createReactor(MilestoneList[ms]);
        reactor.uiShouldIgnore = true;
    }
}