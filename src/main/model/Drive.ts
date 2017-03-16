/// <reference path="../../../typings/index.d.ts" />
/// <reference path="../../../node_modules/excalibur/dist/excalibur.d.ts" />

import { ActivateableComponent, ActivateableResourceData, SlotConsumer, SlotProvider } from "./Equippable";
import { FuelType } from "./Fuel";
import { IHaveResource, IUseResource, ResourceProvider, ResourceConsumer, ResourceStorage } from './Resource';

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

export class Drive extends ActivateableComponent implements IUseResource<FuelType> {

    public static readonly PREFIX:string = "thruster_";

    private internalFuelConsumer:IUseResource<FuelType>;

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
        if (this.internalFuelConsumer.consumeResource(1) < 1) { // TODO: Model fuel(!)
            // TODO: Cut thrust!
            return;
        }
        // TODO: Act on the ship entity in-game
    }

    public getResourceType():FuelType {
        return this.internalFuelConsumer.getResourceType();
    }

    public setResourceType(fuelType:FuelType):boolean {
        // Weapons cannot change their ammo class (this may change)
        return this.internalFuelConsumer.setResourceType(fuelType);
    }

    public getResourceProviders():IHaveResource<FuelType>[] {
        return this.internalFuelConsumer.getResourceProviders();
    }

    public addResourceProvider(ammoSource:IHaveResource<FuelType>):boolean {
        return this.internalFuelConsumer.addResourceProvider(ammoSource);
    }

    public removeResourceProvider(ammoSource:IHaveResource<FuelType>):boolean {
        return this.internalFuelConsumer.removeResourceProvider(ammoSource);
    }

    public consumeResource(fuelRequested:number):number {
        return this.internalFuelConsumer.consumeResource(fuelRequested);
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