/// <reference path="../../../typings/index.d.ts" />
/// <reference path="../../../node_modules/excalibur/dist/excalibur.d.ts" />

import { ActivateableComponent, ActivateableResourceData, SlotConsumer, SlotProvider } from "./Equippable";

export class CapacitorSerialization {
    constructor(
        public id:string, // must be globally unique
        public name:string,
        public mass:number, // kg

        public slotsUsed:string[], 
        public slotsProvided:string[],
        
        public maxCapacity:number, // watts
    ) {
    }
}

export class Capacitor extends ActivateableComponent {

    public static readonly PREFIX:string = "capacitor_";

    private currentCapacity:number;

    constructor(
        id:string, // must be globally unique
        name:string,
        mass:number, // kg

        private slotsUsed:string[], 
        private slotsProvided:string[],

        private maxCapacity:number,
    ) {
        super(
            id, 
            name,
            new SlotConsumer(slotsUsed),
            new SlotProvider(slotsProvided), 
            new ActivateableResourceData(mass, 0, 0)
        );
    }

    public getTickRate():number {
        // Capacitors should activate every tick
        return 0;
    }

    public activate():void {
        // Capacitor logic goes here.
        // If power surplus then charge
        // If power surplus then discharge - exact values undecided
        this.data = new ActivateableResourceData(this.data.getMass(), 0, 0);
    }

    static fromJSON(serialized:CapacitorSerialization): Capacitor {
        return new Capacitor(
            serialized.id,
            serialized.name,
            serialized.mass,
            serialized.slotsUsed,
            serialized.slotsProvided,
            serialized.maxCapacity,
        );
    }
}

console.log(JSON.stringify(
    [
        new Capacitor("capacitor_small_3", "3-cell capacitor bank", 100, ["slot_capacitor_small"], [], 1000000),
    ]
));