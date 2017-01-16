/// <reference path="../../../typings/index.d.ts" />
/// <reference path="../../../node_modules/excalibur/dist/excalibur.d.ts" />

import { ComponentBase, IResourceable, ResourceData, SlotConsumer, SlotProvider } from "./Equippable";

export class ReactorSerialization {
    constructor(
        public id:string, // must be globally unique
        public name:string,
        public mass:number, // kg
        public passivePowerDraw:number, // watts

        public slotsUsed:string[], 
        public slotsProvided:string[],
    ) {
    }
}

export class Reactor extends ComponentBase {

    public static readonly PREFIX:string = "reactor_";

    constructor(
        id:string, // must be globally unique
        name:string,
        mass:number, // kg
        passivePowerDraw:number, // watts

        private slotsUsed:string[], 
        private slotsProvided:string[],
    ) {
        super(
            id, 
            name,
            new SlotConsumer(slotsUsed),
            new SlotProvider(slotsProvided), 
            new ResourceData(mass, passivePowerDraw)
        );
    }

    static fromJSON(serialized:ReactorSerialization): Reactor {
        return new Reactor(
            serialized.id,
            serialized.name,
            serialized.mass,
            serialized.passivePowerDraw,
            serialized.slotsUsed,
            serialized.slotsProvided,
        );
    }
}

console.log(JSON.stringify(
    [
        new Reactor("reactor_large_nuclear", "VF-8C Nuclear Reactor", 1000000, -38000000, ["slot_reactor_large"], []),
        new Reactor("reactor_medium_WR21", "WR-21 Gas Turbine", 46000, -25000000, ["slot_reactor_medium"], []),
        new Reactor("reactor_medium_TB93", "TB-93 Diesel Engine", 21000, -7400000, ["slot_reactor_medium"], []),
        new Reactor("reactor_medium_TB91", "TB-91 Diesel Engine", 11300, -3000000, ["slot_reactor_medium"], []),
        new Reactor("reactor_small_3412", "C3412 Diesel Engine", 2313, -932000, ["slot_reactor_small"], []),
    ]
));