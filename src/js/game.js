import { IncrementalEngine } from './engine.js';

const engine = new IncrementalEngine();

/**
 * This method is called for each 'tick' or cycle generated by requestAnimationFrame
 * @param {} dt 
 */
const onTick = (dt) => {
    engine.onTick(dt);
    updateUI();
    window.requestAnimationFrame(onTick);
}

// DOM elements
const statusDiv = document.getElementById("content");
let buttons = {}

function updateUI() {
    let key;
    let text = "<h1>Incremental Engine Test Game</h1><h2>Currency</h2>";
    
    for (const currency in engine.currencies) {
        text += `${currency}: ${engine.formatNumber(engine.currencies[currency].value)}`;
    }

    text += "<h2>Entities:</h2>";

    for (key in engine.producers) {
        let producer = engine.producers[key];
        text += `${key}s: ${engine.formatNumber(producer.count)}`;
    }

    text += "<h2>Resources:</h2>"

    for (key in engine.resources) {
        let resource = engine.resources[key];
        text += `${key}: ${engine.formatNumber(resource.count)}`;
    }

    for (key in engine.entities) {
        let entity = engine.entities[key];
        text += `${key} (${engine.formatNumber(entity.incrementBy)}/${entity.incrementAfter}ms): ${engine.formatNumber(entity.count)} (${entity.count})<br>`;
    }

    statusDiv.innerHTML = text;
}

// start the timer using animation frame
window.onload = function() {
    createCurrencies();
    createProducers();
    createResources();
    // createEntities();
    connectUItoHandlers();

    console.log("%cIncremental Engine loaded and initialised", "color: blue");

    window.addEventListener("beforeunload", (e) => {
        // persist game state at this point
    });
    window.onblur = function() { console.log("window lost focus %s", Date.now())};
    window.onfocus = function() { console.log("window received focus %s", Date.now())};
   
    window.requestAnimationFrame(onTick);
};

function createCurrencies() {
    engine.createCurrency("gold", 10);
}

function createProducers() {
    engine.createProducer({
        key: "Programmer",
        outputs: {
            resources: {
                "Source Code": {
                    productionTime: 1000,
                    productionAmount: 1
                }
            }
        },
        baseCost: {
            currency: "gold",
            amount: 5
        },
        costCoefficient: 1.1,
        count: 0
    });
}

function createResources() {
    engine.createResource({
        key: "Source Code",
        basePrice: {
            currency: "gold",
            amount: 1
        },
        count: 0
    });
}

function createEntities() {
    engine.createEntity("Source Code", 1000, 1).setCustomProcessor(function(dt) {
        let incrementBy = (this.incrementBy * Math.trunc((dt-this.lastProcessed)/this.incrementAfter));
        this.count += incrementBy;
        this.engine.currency("gold").incrementBy(this.incrementBy);
    });
    engine.createEntity("Graphics", 0, 1);
    engine.createEntity("Sound", 0, 1);
    engine.createEntity("Text", 0, 1);
    engine.createEntity("Translations", 0, 0.1)
        .setCustomProcessor(function (dt) {
        let incrementBy = (this.incrementBy * Math.trunc((dt-this.lastProcessed)/this.incrementAfter));
        this.count += incrementBy;
        if (this.count > this.maxCount) this.count = this.maxCount;
    });
}

function connectUItoHandlers() {
    buttons = {
        "formatScientific": document.getElementById("formatScientific"),
        "formatDictionary": document.getElementById("formatDictionary"),
        "formatAbstract": document.getElementById("formatAbstract"),
        "Programmer": {
            "Buy1": document.getElementById("BuyProgrammer1"),
        },
        "Source Code": {
            "SellAll": document.getElementById("SellSourceCodeAll"),
            "+": document.getElementById("SC+"),
            "-": document.getElementById("SC-")
        },
        "Graphics": {
            "+": document.getElementById("Graphics+"),
            "-": document.getElementById("Graphics-")
        },
        "Sound": {
            "+": document.getElementById("Sound+"),
            "-": document.getElementById("Sound-")
        },
        "Text": {
            "+": document.getElementById("Text+"),
            "-": document.getElementById("Text-")
        },
        "Translations": {
            "+": document.getElementById("Translations+"),
            "-": document.getElementById("Translations-")
        }
    };

    // formatter buttons
    buttons.formatScientific.addEventListener("click", (e) => { engine.setNumberFormatter("scientific") });
    buttons.formatDictionary.addEventListener("click", (e) => { engine.setNumberFormatter("dictionary") });
    buttons.formatAbstract.addEventListener("click", (e) => { engine.setNumberFormatter("abstract") });

    // game and dev control buttons
    for (let key of ["Programmer", "Source Code", "Graphics", "Sound", "Text", "Translations"]) {
        if (buttons[key]["Buy1"]) {
            buttons[key]["Buy1"].addEventListener("click", (e) => {
                if (e.target.dataset.producer) {
                    const producer = engine.producers[e.target.dataset.producer];
                    const currencyType = producer.baseCost.currency;
                    const cost = producer.calculateCost(1);

                    if (engine.currencies[currencyType].value - cost >= 0) {
                        engine.currencies[currencyType].incrementBy(-cost);
                        producer.count += 1;
                        e.target.innerHTML = `Buy 1 for ${producer.calculateCost(1)} ${producer.baseCost.currency}`;
                    }
                } 
/*                
                const baseCost = parseFloat(e.target.dataset.basecost);
                const cost = Math.round(parseFloat(e.target.dataset.cost));
                const entity = e.target.dataset.entity;
                if (engine.currency("gold").value - cost >= 0) {
                    engine.currency("gold").incrementBy(-cost);
                    engine.entities[entity].incrementBy += 1;
                    e.target.dataset.cost = Math.round(baseCost * Math.pow(1.1, engine.entities[entity].incrementBy));
                    e.target.innerHTML = `Buy 1 @ ${e.target.dataset.cost} gold`;
                }
*/                
            });
        }
        if (buttons[key]["SellAll"]) {
            buttons[key]["SellAll"].addEventListener("click", (e) => {
                if (e.target.dataset.resource) {
                    const resource = engine.resources[e.target.dataset.resource];
                    const price = resource.calculatePrice();

                    engine.currencies[price.currency].incrementBy(price.amount);
                    resource.incrementBy(-resource.count);
                }
            });
        }
        if (buttons[key]["+"]) {
            buttons[key]["+"].addEventListener("click", (e) => {
                const entity = e.target.dataset.entity;
                engine.entities[entity].incrementBy += parseFloat(e.target.dataset.incrementby);
            });
        }
        if (buttons[key]["-"]) {
            buttons[key]["-"].addEventListener("click", (e) => {
                const entity = e.target.dataset.entity;
                engine.entities[entity].incrementBy += parseFloat(e.target.dataset.incrementby);
                if ( engine.entities[entity].incrementBy < 0 ) {
                    engine.entities[entity].incrementBy = 0;
                }
            });
        }
    }
}