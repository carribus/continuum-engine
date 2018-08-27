export default
{
    "Lumberjack": {
        key: "Lumberjack",
        outputs: {
            resources: {
                "wood": {
                    productionTime: 1000,
                    productionAmount: 1
                }
            }
        },
        baseCost: {
            currency: "gold",
            amount: 1
        },
        costCoefficient: 1.15,
        count: 1,
        processingEnabled: false,
    },
    "Miner": {
        key: "Miner",
        outputs: {
            resources: {
                "ore": {
                    productionTime: 2500,
                    productionAmount: 1,
                }
            }
        },
        baseCost: {
            currency: "gold",
            amount: 25
        },
        costCoefficient: 1.14,
        count: 0,
        processingEnabled: false,
    },
    "Hunter": {
        key: "Hunter",
        outputs: {
            resources: {
                "skin": {
                    productionTime: 5000,
                    productionAmount: 1,
                }
            }
        },
        baseCost: {
            currency: "gold",
            amount: 500
        },
        costCoefficient: 1.13,
        count: 0,
        processingEnabled: false
    },
    "Butcher": {
        key: "Butcher",
        outputs: {
            resources: {
                "meat": {
                    productionTime: 10000,
                    productionAmount: 1,
                }
            }
        },
        baseCost: {
            currency: "gold",
            amount: 5000
        },
        costCoefficient: 1.12,
        count: 0,
        processingEnabled: false
    },
    "Carpenter" :{
        key: "Carpenter",
        outputs: {
            resources: {
                "furniture": {
                    productionTime: 20000,
                    productionAmount: 1,
                }
            }
        },
        baseCost: {
            currency: "gold",
            amount: 10000
        },
        costCoefficient: 1.11,
        count: 0,
        processingEnabled: false
    },
    "Blacksmith" :{
        key: "Blacksmith",
        outputs: {
            resources: {
                "weapon": {
                    productionTime: 50000,
                    productionAmount: 1,
                }
            }
        },
        baseCost: {
            currency: "gold",
            amount: 20000
        },
        costCoefficient: 1.10,
        count: 0,
        processingEnabled: false
    }

}