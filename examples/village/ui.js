export default class VillageUI {
    constructor(engine) {
        this.engine = engine;
        this.gameElem = document.getElementById("game");
        this.producerElems = {};
    }

    init() {
        function calculateTimeRemaining(out) {
            debugger;
        }

        for (const key in this.engine.producers) {
            const producer = this.engine.producers[key];

            this.producerElems[key] = { title: null, outputs: [] };

            let p = document.createElement("div");
            p.className = "producer";

            let pTitle = document.createElement("p");
            pTitle.className = "title";
            pTitle.innerHTML = `${key} (${producer.count})`;
            p.appendChild(pTitle);
            this.producerElems[key].title = pTitle;

            for (const o in producer.outputs.resources) {
                const out = producer.outputs.resources[o];
                let pOutput = document.createElement("p");
                pOutput.className = "output";
                pOutput.innerHTML = `${out.productionAmount*producer.count} ${o}(s) per ${out.productionTime}ms`;
                p.appendChild(pOutput);

                this.producerElems[key].outputs.push({ key: o, rule: out, elem: pOutput});
            }

            this.gameElem.appendChild(p);
        }
    }

    update() {
        const now = Date.now();

        for (const key in this.producerElems) {
            const prod = this.producerElems[key];
            const producer = this.engine.producers[key];

            for ( const out of prod.outputs ) {
                const progressPerc = this.calculatePercentageComplete(now, out).toFixed(0);
                let text = `${out.rule.productionAmount*producer.count} ${out.key}(s) / ${out.rule.productionTime}ms`;

                if ( producer.count && out.rule.lastProcessed ) {
                    text = `[${progressPerc}%] ` + text;
                }
                out.elem.innerHTML = text;
            }
        }
    }

    calculatePercentageComplete(now, out) {
        return (((now - out.rule.lastProcessed) / out.rule.productionTime)*100);
    }
}