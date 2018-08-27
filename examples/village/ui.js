export default class VillageUI {
    constructor(engine) {
        this.engine = engine;
        this.gameElem = document.getElementById("game");
        this.currencyElem = document.getElementById("currency");
        this.producerElems = {};
    }

    init() {
        this._initProducerElements();
    }

    update() {
        const now = Date.now();

        this.currencyElem.innerHTML = `G ${this.engine.formatNumber(this.engine.currencies["gold"].value)}`;

        for (const key in this.producerElems) {
            const prod = this.producerElems[key];
            const producer = this.engine.producers[key];

            prod.title.innerHTML = `${key}<br/>(${producer.count})`;
            if (producer.count <= 0 ) {
                prod.title.classList.add("disabled")
            } else {
                prod.title.classList.remove("disabled")
            }

            for ( const out of prod.outputs ) {
                const resource = this.engine.resources[out.key];
                const progressPerc = this.calculatePercentageComplete(now, out).toFixed(0);
                const outputValue = resource.basePrice.amount*out.rule.productionAmount*producer.count;
                
                if (!Number.isNaN(outputValue)) {
                    let text = `${this.engine.formatNumber(outputValue)} ${resource.basePrice.currency}`

                    if ( producer.processingEnabled ) {
                        text = `[${progressPerc}%] -> ${text}`;
                    }

                    out.elem.innerHTML = text;
                }
            }

            const cost = producer.calculateCost(1);
            prod.buy.innerHTML = `Buy x 1 - G ${this.engine.formatNumber(cost)}`;
            prod.buy.disabled = this.engine.currencies.gold.value - cost < 0;
        }
    }

    calculatePercentageComplete(now, out) {
        return (((now - out.rule.lastProcessed) / out.rule.productionTime)*100);
    }

    //
    // PRIVATE METHODS
    _initProducerElements() {

        for (const key in this.engine.producers) {
            const producer = this.engine.producers[key];

            this.producerElems[key] = { title: null, outputs: [] };

            let p = document.createElement("div");
            p.className = "producer";

            // Title
            let pTitle = document.createElement("div");
            pTitle.className = "title";
            pTitle.producerObj = producer;
            pTitle.innerHTML = `${key}<br/>(${producer.count})`;
            p.appendChild(pTitle);
            this.producerElems[key].title = pTitle;
            pTitle.addEventListener("click", (e) => {
                const producer = e.target.producerObj;
                if (producer.count && !producer.processingEnabled) {
                    const removeListener = producer.on("PRODUCER_OUTPUT", (e) => {
                        e.producer.processingEnabled = false;
                        // this.engine.currencies["gold"].incrementBy(e.output.calculatePrice(e.output.count).amount);
                        // e.output.incrementBy(-e.output.count);
                        removeListener();
                    });
                    producer.processingEnabled = true;
                }
            });

            for (const o in producer.outputs.resources) {
                const out = producer.outputs.resources[o];
                let pOutput = document.createElement("div");
                pOutput.className = "output";
                pOutput.innerHTML = `${out.productionAmount*producer.count} ${o}(s) per ${out.productionTime}ms`;
                p.appendChild(pOutput);

                this.producerElems[key].outputs.push({ key: o, rule: out, elem: pOutput});
            }

            let pButton = document.createElement("button");
            pButton.className = "button";
            pButton.innerHTML = `Buy x 1 - G ${this.engine.formatNumber(this.engine.producers[key].calculateCost(1))}`;
            pButton.producerObj = this.engine.producers[key];
            pButton.addEventListener("click", (e) => {
                const producer = e.target.producerObj;
                const cost = producer.calculateCost(1);
                if (this.engine.currencies.gold.value - cost >= 0) {
                    producer.incrementBy(1);
                    this.engine.currencies.gold.incrementBy(-cost);
                }
            });
            p.appendChild(pButton);
            this.producerElems[key].buy = pButton;

            this.gameElem.appendChild(p);
        }
    }
}