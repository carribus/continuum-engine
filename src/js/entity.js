export class Entity {
    constructor(key, incrementAfter, startingCount, incrementBy, maxCount) {
        this.key = key;
        this.lastProcessed = 0;
        this.incrementAfter = incrementAfter;
        this.count = startingCount;
        this.incrementBy = incrementBy;
        this.maxCount = maxCount ? maxCount : Number.MAX_VALUE;
        this.customProcessor = null;
        this.engine = null;
    }

    setCustomProcessor(processFunc) {
        if (processFunc === null || processFunc && typeof processFunc == "function") {
            this.customProcessor = processFunc;
        }
        return this;
    }

    processTick(dt) {
        if (this.incrementAfter > 0 && dt - this.lastProcessed >= this.incrementAfter) {
            if (this.customProcessor && typeof this.customProcessor == "function") {
                this.customProcessor(dt)
            } else {
                let incrementBy = (this.incrementBy * Math.trunc((dt-this.lastProcessed)/this.incrementAfter));
                this.count += incrementBy;
                if (this.count > this.maxCount) this.count = this.maxCount;
            }
            this.lastProcessed = dt;
        }
    }
}