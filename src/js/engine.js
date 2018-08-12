export class IncrementalEngine {
    constructor() {
        console.log("IncrementalEngine constructing");
        this.lastTick = 0;
        this.entities = {};
    }

    createEntity(key, incrementAfter, startingCount, incrementBy, maxCount) {
        if (!this.entities[key]) {
            this.entities[key] = {
                lastProcessed: 0,
                incrementAfter,
                count: startingCount,
                incrementBy,
                maxCount: maxCount ? maxCount : Number.MAX_VALUE
            };
        }
        return this.entities[key];
    }

    onTick(dt) {
        // console.log("dt=%s, this.lastTick=%s", dt, this.lastTick);
        if (this.lastTick) {
            if (dt - this.lastTick > 50 ) {
                this.processEntities(dt);
                // store the last tick that we did processing on
                this.lastTick = dt;
            }
        } else {
            this.lastTick = dt;
        }
    }

    processEntities(dt) {
        let entity;
        for (let entName in this.entities) {
            entity = this.entities[entName]
            if (dt - entity.lastProcessed >= entity.incrementAfter) {
                // console.log("Processing %s, %j", entName, entity);
                let incrementBy = (entity.incrementBy * Math.trunc((dt-entity.lastProcessed)/entity.incrementAfter));
                entity.count += incrementBy;
                if (entity.count > entity.maxCount) entity.count = entity.maxCount;
                entity.lastProcessed = dt;
            }

        }
        // debugger;
    }
}

