import ContinuumEngine from '/src/js/engine.js';

const statusDiv = document.getElementById("content");
let buttons = {}
const engine = new ContinuumEngine();

// start the timer using animation frame
window.onload = function() {
    createCurrencies();
    createProducers();
    createResources();
    createModifiers();

    engine.loadState();
    engine.autosavePeriod = 1000;   // save every second

    connectUItoHandlers();

    console.log("%cGame loaded and initialised", "color: blue");

    window.addEventListener("beforeunload", (e) => {
        // persist game state at this point
        engine.saveState();
    });
    window.onblur = function() { console.log("window lost focus %s", Date.now())};
    window.onfocus = function() { console.log("window received focus %s", Date.now())};
   
    window.requestAnimationFrame(onTick);
};

function onTick(dt) {
    engine.onTick(Date.now());
    updateUI();
    window.requestAnimationFrame(onTick);        
}

function createCurrencies() {
    engine.createCurrency("gold", 1000).on("CURRENCY_UPDATED", (e) => {
        console.log(`CURRENCY_UPDATED: ${e.type} ${e.delta}`);
    });
}

function createProducers() {
    engine.createProducer({
        key: "Programmer",
        outputs: {
            resources: {
                "Source Code": {
                    productionTime: 500,
                    productionAmount: 1
                },
                "Bugs": {
                    productionTime: 750,
                    productionAmount: 0.1
                }
            }
        },
        baseCost: {
            currency: "gold",
            amount: 5
        },
        costCoefficient: 1.08,
        count: 0,
        postProcessors: {
            acceleration: {
                func: function(o, stack) {
                    const milestones = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];
                    const currentMilestone = o.milestoneValue || 0;
                    milestones.forEach((milestoneValue) => {
                        if ( o.count >= milestoneValue ) {
                            if (currentMilestone < milestoneValue) {
                                o.outputs.resources["Source Code"].productionTime -= 20;
                                o.outputs.resources["Bugs"].productionTime -= 25;
                                o.milestoneValue = milestoneValue;
                            }
                        }
                    });
                }
            }
        }
    }).on("PRODUCER_COUNT_UPDATED", (e) => {
        console.log(`PRODUCER_COUNT_UPDATED: ${e.key} = ${e.count} (diff: ${e.delta})`);
    });

    engine.createProducer({
        key: "QA Engineer",
        requirements: {
            producers: {
                "Programmer": 10
            }
        },
        inputs: {
            resources: {
                "Bugs": {
                    consumptionTime: 500,
                    consumptionAmount: 0.1
                }
            }
        },
        outputs: {
            resources: {
                "Clean Code": {
                    inputRequirements: [
                        {
                            category: "resources",
                            key: "Bugs",
                            amount: 0.2
                        }
                    ],
                    productionTime: 500,
                    productionAmount: 0.1
                }
            }
        },
        baseCost: {
            currency: "gold",
            amount: 100
        },
        costCoefficient: 1.07,
        count: 0
    }).on("PRODUCER_COUNT_UPDATED", (e) => {
        console.log(`PRODUCER_COUNT_UPDATED: ${e.key} = ${e.count} (diff: ${e.delta})`);
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
    }).on("RESOURCE_COUNT_UPDATED", (e) => {
        console.log(`RESOURCE_COUNT_UPDATED: ${e.key} = ${e.count} (diff: ${e.delta})`);
    });

    engine.createResource({
        key: "Bugs",
        // calculated: {
        //     source: {
        //         type: "resource",
        //         key: "Source Code"
        //     },
        //     calcFunc: function(source) {
        //         return source.count * 0.1;
        //     }
        // },
        count: 0
    }).on("RESOURCE_COUNT_UPDATED", (e) => {
        console.log(`RESOURCE_COUNT_UPDATED: ${e.key} = ${e.count} (diff: ${e.delta})`);
    });

    engine.createResource({
        key: "Clean Code",
        basePrice: {
            currency: "gold",
            amount: 25
        },
        count: 0
    }).on("RESOURCE_COUNT_UPDATED", (e) => {
        console.log(`RESOURCE_COUNT_UPDATED: ${e.key} = ${e.count} (diff: ${e.delta})`);
    });
}

function createModifiers() {
    engine.createModifier({
        key: "DoubleProd",
        applyFunc: function(entityType, entity) {
            if (entityType === "producer") {
                for (const res in entity.outputs.resources) {
                    entity.outputs.resources[res].productionAmount *= 2;
                }
            }
        },
        removeFunc: function(entityType, entity) {
            if (entityType === "producer") {
                for (const res in entity.outputs.resources) {
                    entity.outputs.resources[res].productionAmount /= 2;
                }
            }
        }
    });

    engine.createModifier({
        key: "AutoSell",
        applyFunc: function(entityType, entity) {
            if (entityType === "resource") {
                entity.oldIncrementBy = entity.incrementBy;
                entity.incrementBy = (val) => {
                    entity.oldIncrementBy.call(entity, val);
                    const price = entity.calculatePrice();

                    if (price) {
                        engine.currencies[price.currency].incrementBy(price.amount);
                        entity.oldIncrementBy.call(entity, -entity.count);
                    }
                }
            }
        },
        removeFunc: function(entityType, entity) {
            if (entityType === "resource") {
                if (entity.oldIncrementBy) {
                    entity.incrementBy = entity.oldIncrementBy;
                    delete entity.oldIncrementBy;
                }
            }
        }
    })
}

function updateUI() {
    let key;
    let text = "<h1>Incremental Engine Test Game</h1><h2>Currency</h2>";
    
    for (const currency in engine.currencies) {
        text += `${currency}: ${engine.formatNumber(engine.currencies[currency].value)}`;
    }

    text += "<h2>Entities:</h2>";

    const renderInputsOutputs = (o, type, category, data) => {
        if (data && data[category]) {
            const arrow = (type == "inputs" ? "<=" : "=>");
            const [amount, time] = (type == "inputs" ? ["consumptionAmount", "consumptionTime"] : ["productionAmount", "productionTime"]);
            Object.keys(data[category]).map((out) => {
                text += `&nbsp;&nbsp;${arrow} ${out} = ${engine.formatNumber(data[category][out][amount]*o.count)} / ${data[category][out][time]}s<br/>`;
            });
        }
    };

    for (key in engine.producers) {
        let producer = engine.producers[key];
        text += `${key}s: ${engine.formatNumber(producer.count)}<br/>`;
        renderInputsOutputs(producer, "inputs", "resources", producer.inputs);
        renderInputsOutputs(producer, "outputs", "resources", producer.outputs);
        text += "<br/>";
    }

    text += "<h2>Resources:</h2>"

    for (key in engine.resources) {
        let resource = engine.resources[key];
        if ( resource.count !== null && resource.count !== undefined ) {
            text += `${key}: ${engine.formatNumber(resource.count)}<br/>`;
        } else {
            throw `Resource ${key} does not have a .count property`;
        }
    }

    for (key in engine.entities) {
        let entity = engine.entities[key];
        text += `${key} (${engine.formatNumber(entity.incrementBy)}/${entity.incrementAfter}ms): ${engine.formatNumber(entity.count)} (${entity.count})<br>`;
    }

    statusDiv.innerHTML = text;
}

function connectUItoHandlers() {
    buttons = {
        "formatScientific": document.getElementById("formatScientific"),
        "formatDictionary": document.getElementById("formatDictionary"),
        "formatAbstract": document.getElementById("formatAbstract"),
        "clearState": document.getElementById("clearstate"),
        // currencies
        "Gold": {
            "+": document.getElementById("gold+")
        },
        // producers
        "Programmer": {
            "Buy1": document.getElementById("BuyProgrammer1"),
        },
        "QA Engineer": {
            "Buy1": document.getElementById("BuyQA1"),
        },
        // resources
        "Source Code": {
            "SellAll": document.getElementById("SellSourceCodeAll"),
            "+": document.getElementById("SC+"),
            "-": document.getElementById("SC-")
        },
        "Bugs": {
            "+": document.getElementById("Bugs+"),
            "-": document.getElementById("Bugs-")
        },
        "Clean Code": {
            "SellAll": document.getElementById("SellCleanCodeAll"),
            "+": document.getElementById("Clean Code+"),
            "-": document.getElementById("Clean Code-")
        },
        // modifiers
        "Modifiers": {
            "DoubleProd10s": document.getElementById("Mod_DoubleProduction10s"),
            "DoubleProd30s": document.getElementById("Mod_DoubleProduction30s"),
            "AutoSell60s": document.getElementById("Mod_AutoSell60s")
        }
    };

    // formatter buttons
    buttons.formatScientific.addEventListener("click", (e) => { engine.setNumberFormatter("scientific") });
    buttons.formatDictionary.addEventListener("click", (e) => { engine.setNumberFormatter("dictionary") });
    buttons.formatAbstract.addEventListener("click", (e) => { engine.setNumberFormatter("abstract") });

    buttons.clearState.addEventListener("click", (e) => { 
        window.localStorage.clear();
        window.location.reload(true);
    });

    // game and dev control buttons
    for (let key of ["Programmer", "QA Engineer", "Source Code", "Bugs", "Clean Code"]) {
        if (buttons[key]["Buy1"]) {
            buttons[key]["Buy1"].addEventListener("click", (e) => {
                if (e.target.dataset.producer) {
                    const producer = engine.producers[e.target.dataset.producer];
                    if ( producer && producer.requirementsMet() ) {
                        const currencyType = producer.baseCost.currency;
                        const cost = producer.calculateCost(1);
    
                        if (engine.currencies[currencyType].value - cost.price >= 0) {
                            engine.currencies[currencyType].incrementBy(-cost.price);
                            producer.incrementBy(1);
                            e.target.innerHTML = `Buy 1 for ${engine.formatNumber(cost.price)} ${cost.currency}`;
                        }
                    }
                } 
            });
            if ( engine.producers[key] ) {
                const cost = engine.producers[key].calculateCost(1);
                buttons[key]["Buy1"].innerHTML = `Buy 1 @ ${engine.formatNumber(cost.price)} ${cost.currency}`;
            }
        }
        if (buttons[key]["SellAll"]) {
            buttons[key]["SellAll"].addEventListener("click", (e) => {
                if (e.target.dataset.resource) {
                    const resource = engine.resources[e.target.dataset.resource];
                    if ( resource ) {
                        const price = resource.calculatePrice();

                        engine.currencies[price.currency].incrementBy(price.amount);
                        resource.incrementBy(-resource.count);
                    }
                }
            });
        }
        if (buttons[key]["+"]) {
            buttons[key]["+"].addEventListener("click", (e) => {
                const entity = e.target.dataset.entity;
                engine.resources[entity].incrementBy(parseFloat(e.target.dataset.incrementby));
            });
        }
        if (buttons[key]["-"]) {
            buttons[key]["-"].addEventListener("click", (e) => {
                const entity = e.target.dataset.entity;
                engine.resources[entity].incrementBy(parseFloat(e.target.dataset.incrementby));
                if ( engine.resources[entity].incrementBy < 0 ) {
                    engine.resources[entity].incrementBy = 0;
                }
            });
        }
    }

    buttons.Gold["+"].addEventListener("click", (e) => {
        engine.currencies["gold"].incrementBy(parseInt(e.target.dataset.incrementby));
    });

    // modifier buttons
    for (const modBtn in buttons.Modifiers) {
        buttons.Modifiers[modBtn].addEventListener("click", (e) => {
            const modifierKey = e.target.dataset.modifier;
            let params = e.target.dataset.params;

            engine.activateModifier(modifierKey, {
                timeLeft: parseInt(params)*1000
            });
        });
    }
}