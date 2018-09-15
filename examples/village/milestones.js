const eventHandlers = [
    {
        event: "PRODUCER_COUNT_UPDATED",
        handler: function(e) {
            const milestones = [5, 10, 25, 50, 75, 100, 150, 200, 300, 400, 500, 750, 1000, 2500, 5000, 10000]
            const timeReductionFactor = 0.8;
            const resourceValueIncreaseFactor = 2;

            if (this.lastCount ) {
                if (this.lastCount != e.obj.count) {
                    for (let i = 0; i < milestones.length-1; i++) {
                        if ( this.lastCount < milestones[i] && e.obj.count >= milestones[i] ) {
                            for (const key in e.obj.outputs.resources) {
                                e.obj.outputs.resources[key].productionTime *= timeReductionFactor; 
                                console.log(`${e.obj.key} reduces production time of resource ${key} to ${e.obj.outputs.resources[key].productionTime}ms`)
                                // for every second milestone, also double the value of the resource produced
                                if (i % 2 !== 0) {
                                    this.engine.resource(key).basePrice.amount *= resourceValueIncreaseFactor;
                                    console.log(`${key} resource value increased to ${this.engine.resource(key).basePrice.amount}`);
                                }
                            }
                        }
                    }
                }
            } 
            this.lastCount = e.obj.count;
        }
    }
]

export default
{
    MSLumberjack: {
        key: "Lumberjack Milestones",
        entityType: "producer",
        entityKey: "Lumberjack",
        count: 1,
        maxCount: 1,
        eventHandlers: eventHandlers        
    },
    MSMiner: {
        key: "Miner Milestones",
        entityType: "producer",
        entityKey: "Miner",
        count: 1,
        maxCount: 1,
        eventHandlers: eventHandlers        
    },
    MSHunter: {
        key: "Hunter Milestones",
        entityType: "producer",
        entityKey: "Hunter",
        count: 1,
        maxCount: 1,
        eventHandlers: eventHandlers        
    },
    MSButcher: {
        key: "Butcher Milestones",
        entityType: "producer",
        entityKey: "Butcher",
        count: 1,
        maxCount: 1,
        eventHandlers: eventHandlers        
    },
    MSCarpenter: {
        key: "Carpenter Milestones",
        entityType: "producer",
        entityKey: "Carpenter",
        count: 1,
        maxCount: 1,
        eventHandlers: eventHandlers        
    },
    MSBlacksmith: {
        key: "Blacksmith Milestones",
        entityType: "producer",
        entityKey: "Blacksmith",
        count: 1,
        maxCount: 1,
        eventHandlers: eventHandlers        
    },
}