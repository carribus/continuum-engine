export default class VillageUI {
    constructor(engine) {
        this.engine = engine;
        this.gameElem = document.getElementById("game");
        this.productionElem = document.getElementById("production");
        this.managementElem = document.getElementById("management");
        this.currencyElem = document.getElementById("currency");
        this.producerElems = {};
        this.managerElems = {};
    }

    init() {
        this._initProducerElements();
        this._initManagerElements();
    }

    update() {
        const now = Date.now();

        this.currencyElem.innerHTML = `G ${this.engine.formatNumber(this.engine.currencies["gold"].value)}`;

        for (const key in this.producerElems) {
            const prod = this.producerElems[key];
            const producer = this.engine.producers[key];

            prod.title.innerHTML = `${key}<br/>(${producer.count})`;
            prod.title.disabled = producer.count <= 0 ? true : false;

            for ( const out of prod.outputs ) {
                const resource = this.engine.resources[out.key];
                const progressPerc = this.calculatePercentageComplete(now, out).toFixed(0);
                const outputValue = resource.basePrice.amount*out.rule.productionAmount*producer.count;
                
                if (!Number.isNaN(outputValue)) {
                    let text = `${this.engine.formatNumber(outputValue)} ${resource.basePrice.currency}`

                    if ( producer.processingEnabled && producer.count > 0 ) {
                        text = `[${progressPerc}%] -> ${text}`;
                    }

                    out.elem.innerHTML = text;
                }
            }

            const cost = producer.calculateCost(1);
            prod.buy.innerHTML = `Buy x 1 - G ${this.engine.formatNumber(cost)}`;
            prod.buy.disabled = this.engine.currencies.gold.value - cost < 0;
        }

        for (const key in this.managerElems) {
            const manager = this.managerElems[key].title.managerObj;
            this.managerElems[key].title.disabled = manager.count > 0 ? true : false;
        }
    }

    calculatePercentageComplete(now, out) {
        return (((now - out.rule.lastProcessed) / out.rule.productionTime)*100);
    }

    //
    // PRIVATE METHODS
    _initProducerElements() {
        const onBuyButtonPressed = (e) => {
            const producer = e.target.producerObj;
            const cost = producer.calculateCost(1);
            if (this.engine.currencies.gold.value - cost >= 0) {
                producer.incrementBy(1);
                this.engine.currencies.gold.incrementBy(-cost);
            }
        };

        const onStartProcessingButtonPressed = (e) => {
            const producer = e.target.producerObj;
            if (producer.count) {
                producer.processingEnabled = true;
            }
        }

        for (const key in this.engine.producers) {
            const producer = this.engine.producers[key];

            this.producerElems[key] = { title: null, outputs: [] };

            let p = document.createElement("div");
            p.className = "producer";

            // Title
            let pTitle = document.createElement("button");
            pTitle.className = "title";
            pTitle.producerObj = producer;
            pTitle.innerHTML = `${key}<br/>(${producer.count})`;
            p.appendChild(pTitle);
            this.producerElems[key].title = pTitle;
            pTitle.addEventListener("touchstart", onStartProcessingButtonPressed);
            pTitle.addEventListener("click", onStartProcessingButtonPressed);

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
            pButton.addEventListener("touchstart", onBuyButtonPressed);
            pButton.addEventListener("click", onBuyButtonPressed);
            p.appendChild(pButton);
            this.producerElems[key].buy = pButton;

            this.productionElem.appendChild(p);
        }
    }

    _initManagerElements() {
        for (const key in this.engine.reactors) {
            const manager = this.engine.reactor(key);
            if (manager.uiShouldIgnore) continue;
            let p = document.createElement("div");
            p.className = "manager";

            this.managerElems[manager.key] = { block: p, title: null };

            // Title
            let pTitle = document.createElement("button");
            pTitle.className = "title";
            pTitle.managerObj = manager;
            pTitle.innerHTML = `${manager.key}<br/>(${this.engine.formatNumber(manager.basePrice.amount)} ${manager.basePrice.currency})`;
            p.appendChild(pTitle);
            this.managerElems[manager.key].title = pTitle;
            pTitle.addEventListener("click", (e) => {
                const manager = e.target.managerObj;
                const currency = this.engine.currency(manager.basePrice.currency);

                if (manager.count <= 0) {
                    if ( manager.purchase(currency) ) {
                        this.managerElems[manager.key].block.classList.add('hidden');
                    }
                }
            });

            this.managementElem.appendChild(p);
            
        }
    }
}