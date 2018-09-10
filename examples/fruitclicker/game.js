import ContinuumEngine from "./engine/js/engine.js";
import GameUI from "./ui.js";
import FruitAssets from "./resources.js"

export default class Game {
    constructor() {
        this.engine = new ContinuumEngine();
        this.currentFruitIndex = 0;
        this.currentFruit = FruitAssets[this.currentFruitIndex];
        this.juicePerTap = 1;
        this.tapPowerBaseCost = 100;
        this.tapPowerCoefficient = 1.08;
        this.baseJuiceToNextLevel = 250;
        this.juiceCoefficient = 1.45;
        this.juiceToNextLevel = this.baseJuiceToNextLevel;
        this.score = 0;

        this.initEngine();

        this.ui = new GameUI(document.getElementById("game"));
        this.ui.init(this);
    }

    initEngine() {
        // this is the currency of the game
        this.engine.createCurrency("Juice", 0)
            .on("CURRENCY_UPDATED", (e) => {
                this.score += e.delta;
                if (e.delta > 0) {
                    this.juiceToNextLevel -= e.delta
                }

                if ( this.juiceToNextLevel <= 0 ) {
                    this.currentFruitIndex++;
                    this.currentFruit = FruitAssets[this.currentFruitIndex % FruitAssets.length];
                    this.ui.currentFruit = this.currentFruit.name;
                    this.juiceToNextLevel = Math.floor(this.baseJuiceToNextLevel * Math.pow(this.juiceCoefficient, this.currentFruitIndex));
                }
            });

        // we create a producer to use for the auto-clicker feature. Each time an autoclicker is purchased, we simple up the count of the
        // producer. This also gives us an easy way of calculating the cost of the next auto-clicker
        this.engine.createProducer({
            key: "autoclicker",
            baseCost: {
                currency: "Juice",
                amount: 50
            },
            costCoefficient: 1.12,
            count: 0,
            outputs: {
                currencies: {
                    "Juice": {
                        productionTime: 1000,
                        productionAmount: 1
                    }
                }
            },
            processingEnabled: false
        })
    }

    incrementScore(byValue) {
        this.engine.currency('Juice').incrementBy(byValue);
    }

    get producer() {
        return this.engine.producer("autoclicker");
    }

    purchaseAutoClicker() {
        const cost = this.producer.calculateCost(1);
        if (this.engine.currency("Juice").value - cost >= 0) {
            this.producer.incrementBy(1);
            this.engine.currencies["Juice"].incrementBy(-cost);
            this.producer.processingEnabled = true;
        }
    }

    purchaseTapPower() {
        const cost = this.calculateTapPowerCost(1);
        if (this.engine.currency("Juice").value - cost >= 0) {
            this.engine.currencies["Juice"].incrementBy(-cost);
            this.juicePerTap++;
        }
    }

    calculateTapPowerCost(num) {
        return Math.round(this.tapPowerBaseCost * Math.pow(this.tapPowerCoefficient, this.juicePerTap));
    }

    onTick(dt) {
        this.engine.onTick(dt);
        this.ui.onTick(dt);
    }
}