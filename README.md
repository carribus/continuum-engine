# Continuum Engine

The Continuum Engine is a game engine built in Javascript to help power the creation of games in the [incremental, idle and clicker genre](https://en.wikipedia.org/wiki/Incremental_game).

Currently the engine is in very early-stage development, so if you stumble upon this repo, you should probably move along since there's not much to talk about here yet :)

## How it works

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
