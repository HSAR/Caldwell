/// <reference path="../../../typings/index.d.ts" />
/// <reference path="../../../node_modules/excalibur/dist/excalibur.d.ts" />

import { ActivateableComponent, ActivateableResourceData, SlotConsumer, SlotProvider } from "./Equippable";

import { StaticTextCollection } from "../util/StaticTextCollection";

export class DriveSerialization {
    constructor(
        public id:string, // must be globally unique
        public name:string,
        public mass:number, // kg
        public passivePowerDraw:number, // watts
        public activePowerDraw:number, //watts

        public slotsUsed:string[], 
        public slotsProvided:string[],

        public maxThrust:number, // N
        public specificImpulse, // specific fuel consumption * maxThrust
    ) {
    }
}

export class Drive extends ActivateableComponent {

    public static readonly PREFIX:string = "thruster_";

    constructor(
        id:string, // must be globally unique
        name:string,
        mass:number, // kg
        passivePowerDraw:number, // watts
        activePowerDraw:number, //watts

        private slotsUsed:string[], 
        private slotsProvided:string[],

        public maxThrust:number, // N
        public specificImpulse, // specific fuel consumption * maxThrust
    ) {
        super(
            id, 
            name,
            new SlotConsumer(slotsUsed),
            new SlotProvider(slotsProvided), 
            new ActivateableResourceData(mass, passivePowerDraw, activePowerDraw)
        );
    }

    public getTickRate():number {
        return 0; // We need to check every tick to update fuel consumption, etc.
    }

    public activate():void {
        if (this.internalAmmoConsumer.consumeRounds(1) < 1) { // TODO: Model fuel(!)
            // TODO: Cut thrust!
            return;
        }
        // TODO: Act on the ship entity in-game
    }

    static fromJSON(serialized:DriveSerialization): Drive {
        return new Drive(
            serialized.id,
            serialized.name,
            serialized.mass,
            serialized.passivePowerDraw,
            serialized.activePowerDraw,
            serialized.slotsUsed,
            serialized.slotsProvided,
            serialized.maxThrust,
            serialized.specificImpulse,
        );
    }
}

console.log(JSON.stringify(
    [
        new Drive("drive_small_merlin1D", "Merlin 1D", 630, 0, 0, ["slot_drive_small"], [], 420000, 275),
    ]
));