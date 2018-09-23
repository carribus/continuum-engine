# Continuum Engine

The Continuum Engine is a game engine built in Javascript to help power the creation of games in the [incremental, idle and clicker genre](https://en.wikipedia.org/wiki/Incremental_game).

Currently the engine is in very early-stage development, so if you stumble upon this repo, you should probably move along since there's not much to talk about here yet :)

## Examples

I recommend starting with the examples to see how the engine can be used. The examples can be found in the `examples/` folder.

### Running the examples (locally):

1. You need a web-server. I suggest installed [http-server](https://www.npmjs.com/package/http-server)
2. Once you have the server, simply type: `http-server .` (don't forget the trailing .)

### Running the examples online:

[Idle-RPG: The Quest for more Quests](https://carribus.github.io/continuum-engine/examples/idle_rpg/index.html)

This example demonstrates how to use producers to drive event-based games like a hero running around a world killing monsters and levelling up.

[Fruit Clicker](https://carribus.github.io/continuum-engine/examples/fruitclicker/index.html)

A basic clicker implementation. Demonstrate how to generate resources from user interaction and also create 'auto-clickers'

[Merge RPG](https://carribus.github.io/continuum-engine/examples/merge_rpg/index.html)

A small example of how to build an Idle Merge game.

[Village Life](https://carribus.github.io/continuum-engine/examples/village/index.html)

A very very basic example of how to build a basic resource generation game like AdCap. Remember... this is a very basic example :)

## How Continuum Engine works

### Entities:

At the core of the engine is an Entity. An entity represents the concept of 'a thing'.

In the current engine, there are two such 'things':

#### Producers

As the name implies, Producer are able to create other Entities or 'things'. Producers are also able to consume Entities as 'inputs' to the production process. For example, if you wanted a Woodcutter producer to produce wood, you would need a Tree resource for the Woodcutter to consume in order to create wood. 

Producers can consume input resources at different rates from their production rates of output resources.
Producers can also produce other producers.

Producers can have a cost associated with them, along with a co-efficient. If a cost and co-efficient are specified, the engine will automatically calculate the cost of the next *n* producers to be purchased (binomial scaling).

#### Resources

As mentioned in the Producer's description above, a Resource is a thing that is created (or consumed) by a Producer (generally speaking). Resources generate events when their 'count' changes that other parts of your code can subscribe to and react are you need. 

### Currencies

The engine also supports the concept of currencies. You can create as many (or as few) currencies as you wish. Currencies are interesting because they can be used to set 'purchase costs' for Producers and 'sell prices' for Resources. 

## Resource definition

To create a resource, you call the `engine.createresource(defObj)` method and pass in an object which contains one or more of the following properties:

| Property          | Required?     | Type      | Description                                                       |
| -----------       | -----------   | ------    | ----------------------------------------------------------------  |
| key               | Required      | `string`  | (Inherited from Entity) The identifier for the Resource entity                            |
| basePrice         | *optional*    | `Currency`| The price for the resource (expressed in units of a specific currency |
| calculated        | *optional*    | `CalcDefObj`| If present, this function is called to calculate the current 'count' value based on other entities |
| count             | *optional*    | `integer` | (Inherited from Entity) The starting number of resources of this type |
| maxCount          | *optional*    | `integer` | (Inherited from Entity) Maximum number of resources of this type that are allowed |
| requirements      | *optional*    | `RequirementMap` | (Inherited from Entity) A structure of requirements that the producer needs to be satisfied before |it can be created |

*Example*
```javascript
engine.createResource({
    key: "Wood",
    basePrice: {
        currency: "gold",
        amount: 10
    },
    count: 0
})
```

### CalcDefObj

The `CalcDefObj` object of a `Resource` definition allows you to specify a calculation function for the Resource's count property.

| Property          | Required?     | Type      | Description                                                       |
| -----------       | -----------   | ------    | ----------------------------------------------------------------  |
| source            | Required      | `EntityRefObj` | The source Entity on which the calculation will be based                       |
| calcFunc          | Required      | `function`| The function that is called when the count of a Resource requires recalculation (usually each **tick**) |

*Example*
```javascript
// This creates a resource called 'Bugs' which derives its 'count' value based on the amount of 'Source Code' resource which exists.
// It is assumed that the 'Source Code' resource exists. If it does, the count of Bugs resource will equal 0.1 x [Source Code].count at all times
// NOTE: The resource.count property of a calculated Resource is updated automatically once the 'calcFunc' returns
engine.createResource({
    key: "Bugs",
    calculated: {
        source: {
            type: "resource",
            key: "Source Code"
        },
        calcFunc: function(source) {
            return source.count * 0.1;
        }
    }
    count: 0
})
```

## Producer definition

To create a producer, you call the `engine.createProducer(defObj)` method and pass in an object which contains one or more of the following properties:

| Property          | Required?     | Type      | Description                                                       |
| -----------       | -----------   | ------    | ----------------------------------------------------------------  |
| key               | Required      | `string`  | The identifier for the Producer entity                            |
| count             | *optional*    | `integer` | (Inherited from Entity) The starting number of producers         |
| maxCount          | *optional*    | `integer` | (Inherited from Entity) Maximum number of producers that are allowed |
| baseCost          | *optional*    | `Currency`| The base cost for the first producer.                             |
| costCoefficient   | *optional*    | `Number`  | The cost co-efficient to be used for scaling the cost. For example: 1.07 |
| outputs           | Required      | `OutputMap` | A structure of outputs that the producer will produce        |
| inputs            | *optional*    | `InputMap` | A structure of inputs that the producer will consume for its outputs |
| requirements      | *optional*    | `RequirementMap` | (Inherited from Entity) A structure of requirements that the producer needs to be satisfied before |it can be created |
| postProcessors    | *optional*    | `PostProcessorMap` | A structure that contains developer-named post processing functions that execute after inputs and outputs have been processed |


### OutputMap
The `OutputMap` object must contain *at least* one output category (for example, `resources` or `producers`).

| Property          | Required?     | Type      | Description                                                       |
| -----------       | -----------   | ------    | ----------------------------------------------------------------  |
| resources         | *optional*    | `OutputRuleMap` | A map of 1 or more output rules (one per resource)            |
| producers         | *optional*    | `OutputRuleMap` | A map of 1 or more output rules (one per producer)            |

Each property within the `resources` or `producers` OutputRuleMap must correspond to a resource or producer key in the system.

*Example*
```javascript
{
    ...
    outputs: {
            resources: {
                "ResourceExampleKey": {
                    productionTime: 500,
                    productionAmount: 0.1
                }
            }
        }    
    ...
}
```

#### OutputRule
The `OutputRule` object defines the rules for a producer's output of a specific Entity type

| Property          | Required?     | Type      | Description                                                       |
| -----------       | -----------   | ------    | ----------------------------------------------------------------  |
| productionAmount  | Required      | `Number`  | The amount of the output entity to create (eg 0.1, 1, 2.5 etc) per `productionTime` period   |
| productionTime    | Required      | `integer` | The time it takes for the `productionAmount` of output entity to be created             |
| inputRequirements | *optional*    | `array[InputRequirement]` | An array of input requirements. This defines the inputs needed to create the entity. Should only be used if the producer has `inputs` specified |

*Example*
```javascript
{
    ...
        resources: {
            "Wood Planks": {
                productionTime: 500,
                productionAmount: 1,
                inputRequirements: [
                    {
                        category: "resources",
                        key: "Wood",
                        amount: 2
                    }
                ],
            }
        }
    ...
}
```

#### InputRequirement

The `InputRequirement` object defines the required amount of *input* entity that must have been consumed in order to create the required output Entity that the InputRequirements refer to.

| Property          | Required?     | Type      | Description                                                       |
| -----------       | -----------   | ------    | ----------------------------------------------------------------  |
| category          | Required      | `string`  | The entity type for the input (eg `resources` or `producers`)     |
| key               | Required      | `string`  | The key (identifier) of the Entity that is the requirement        |
| amount            | Required      | `Number`  | The minimum amount of the input Entity required to have been consumed to create the outputs |


### InputMap
The `InputMap` object must contain *at least* one entity category (for example, `resources` or `producers`).

| Property          | Required?     | Type      | Description                                                       |
| -----------       | -----------   | ------    | ----------------------------------------------------------------  |
| resources         | *optional*    | `InputRuleMap` | A map of 1 or more input rules (one per resource)            |
| producers         | *optional*    | `InputRuleMap` | A map of 1 or more input rules (one per producer)            |

Each property within the `resources` or `producers` InputRuleMap must correspond to a resource or producer key in the system.

#### InputRule
The `InputRule` object defines the rules for a producer's input consumption of a specific Entity type

| Property          | Required?     | Type      | Description                                                       |
| -----------       | -----------   | ------    | ----------------------------------------------------------------  |
| consumptionAmount | Required      | `Number`  | The amount of the input entity to consume (eg 0.1, 1, 2.5 etc) per `consumptionTime` period   |
| consumptionTime   | Required      | `integer` | The time it takes for the `consumptionAmount` of input entity to be consumed             |


### RequirementMap
The `RequirementMap` object must contain *at least* one entity category (for example, `resources` or `producers`).

| Property          | Required?     | Type      | Description                                                       |
| -----------       | -----------   | ------    | ----------------------------------------------------------------  |
| resources         | *optional*    | ``RequirementRuleMap` | A map of 1 or more resource requirement rules (one per resource)            |
| producers         | *optional*    | `RequirementRuleMap` | A map of 1 or more producer requirement rules (one per producer)            |

*Example*
```javascript
{
    ...
        requirements: {
            producers: {
                "Woodcutter": 10
            }
        },
    ...
}
```

#### RequirementRuleMap
The 'RequirementRuleMap' object defines the minimum requirements that must be met before a producer can be created. For example, before you can create Woodcutter, you need trees for the Woodcutter to chop down.

| Property          | Required?     | Type      | Description                                                       |
| -----------       | -----------   | ------    | ----------------------------------------------------------------  |
| {EntityKey}       | Required      | `Number`  | A value the defines the minimum number of this type of Entity that must exist |

### Putting it all together

Lets have a look at a complete example now.. We are going to create a Woodcutter (producer) that outputs Wood (resource). It uses Trees (Resource) as an input and consumes them at a specific rate...

```javascript
import { ContinuumEngine } from './engine.js';

const engine = new ContinuumEngine();

const WoodCutter = engine.createProducer({
    key: "woodcutter",
    requirements: {
        resources: {
            "tree": 5                           // We need at least 5 trees before we can create a woodcutter
        }
    },
    baseCost: {                                 // here we define that a woodcutter's base cost is 100 gold (a currency we define elsewhere)
        currency: "gold",
        amount: 100
    },
    costCoefficient: 1.07,                      // the cost per resource increases by a factor of 1.07
    count: 0                                    // start off with 0 woodcutters
    inputs: {
        resources: {
            "tree": {
                consumptionTime: 1000,          // every second (1000ms)...
                consumptionAmount: 1            // chop down 1 tree as our input
            }
        }
    },
    outputs: {
        resources: {
            "wood": {
                inputRequirements: [            // to create wood, we use trees as our requirement
                    {
                        category: "resources",
                        key: "tree",
                        amount: 1               // we need at least 1 tree to create a single production of wood (defined below)
                    }
                ],
                productionTime: 2000,           // every 2 seconds,
                productionAmount: 4             // we create 4 wood resources
            }
        }
    }
})
```

### PostProcessorMap
To be written...

