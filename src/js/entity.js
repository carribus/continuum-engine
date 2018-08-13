export class Entity {
    constructor(key, incrementAfter, startingCount, incrementBy, maxCount) {
        this.key = key;
        this.lastProcessed = 0;
        this.incrementAfter = incrementAfter;
        this.count = startingCount;
        this.incrementBy = incrementBy;
        this.maxCount = maxCount ? maxCount : Number.MAX_VALUE;
    }

    processTick(dt) {
        if (dt - this.lastProcessed >= this.incrementAfter) {
            // console.log("Processing %s, %j", entName, entity);
            let incrementBy = (this.incrementBy * Math.trunc((dt-this.lastProcessed)/this.incrementAfter));
            this.count += incrementBy;
            if (this.count > this.maxCount) this.count = this.maxCount;
            this.lastProcessed = dt;
        }
    }
}