export default
{
    forest: {
        key: "forest",
        outputs: {
            resources: {
                "tree": {
                    productionTime: 5000,
                    productionAmount: 2
                }
            }
        },
        baseCost: {
            currency: "gold",
            amount: 0
        },
        costCoefficient: 1.05,
        count: 1,
    },
    woodcutter: {
        key: "woodcutter",
        inputs: {
            resources: {
                "tree": {
                    consumptionTime: 5000,
                    consumptionAmount: 1,
                }
            }
        },
        outputs: {
            resources: {
                "wood": {
                    productionTime: 10000,
                    productionAmount: 2,
                    inputRequirements: [
                        {
                            category: "resources",
                            key: "tree",
                            amount: 1
                        }
                    ]
                }
            }
        },
        baseCost: {
            currency: "gold",
            amount: 5
        },
        costCoefficient: 1.05,
        count: 0,
    }
}