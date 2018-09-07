/*
    We define a single event handler for all the managers since they are all concerned with 
    the automation of the entity processing. The logic behind the automation is to stop processing
    if the 'manager' or reactor does not actually exist.
*/
const eventHandlers = [
    { 
        event: "PRODUCER_OUTPUT",
        handler: function(e) {
            if (this.count === 0) {
                // console.log(`lack of management stop auto processing of producer ${e.key}`);
                this.entity.processingEnabled = false;
            }
        }
    }
]

export default
{
    LumberJackMgr: {
        key: "Lumberjack Manager",
        entityType: "producer",
        entityKey: "Lumberjack",
        basePrice: {
            currency: "gold",
            amount: 500
        },
        count: 0,
        maxCount: 1,
        eventHandlers: eventHandlers
    },
    MinerMgr: {
        key: "Miner Manager",
        entityType: "producer",
        entityKey: "Miner",
        basePrice: {
            currency: "gold",
            amount: 1000
        },
        count: 0,
        eventHandlers: eventHandlers
    },
    HunterMgr: {
        key: "Hunter Manager",
        entityType: "producer",
        entityKey: "Hunter",
        basePrice: {
            currency: "gold",
            amount: 5000
        },
        count: 0,
        eventHandlers: eventHandlers
    },
    ButcherMgr: {
        key: "Butcher Manager",
        entityType: "producer",
        entityKey: "Butcher",
        basePrice: {
            currency: "gold",
            amount: 10000
        },
        count: 0,
        eventHandlers: eventHandlers
    },
    CarpenterMgr: {
        key: "Carpenter Manager",
        entityType: "producer",
        entityKey: "Carpenter",
        basePrice: {
            currency: "gold",
            amount: 50000
        },
        count: 0,
        eventHandlers: eventHandlers
    },
    BlacksmithMgr: {
        key: "Blacksmith Manager",
        entityType: "producer",
        entityKey: "Blacksmith",
        basePrice: {
            currency: "gold",
            amount: 100000
        },
        count: 0,
        eventHandlers: eventHandlers
    },
}