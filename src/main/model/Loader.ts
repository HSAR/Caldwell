/// <reference path="../../../typings/index.d.ts" />

import { Bag } from 'typescript-collections';
import * as path from "path";

import { Entity } from "../Entity";
import { ActivateableComponent, ActivateableResourceData, ComponentBase, ResourceData, SlotConsumer, SlotProvider } from "./Equippable";
import { IHaveResource, IUseResource, ResourceProvider, ResourceConsumer, ResourceStorage } from './Resource';
import { AmmoClass, AmmoType } from "./Ammo";

import { StaticTextCollection } from "../util/StaticTextCollection";

export class AmmoBox extends ResourceStorage<AmmoType> implements IHaveResource<AmmoType> {

    constructor(
        id:string, // must be globally unique
        name:string,

        slotsUsed:string[], 
        slotsProvided:string[],

        roundsLoaded:[[string, number]] // Multiple types can be supported. [["ammo_012x099mm", 100], ["ammo_030x173mm_shell", 10]] 
    ) {
        super(
            "loader_ammobox",  // ammo boxes are currently singletons
            AmmoBox.nameFromRoundsLoaded(roundsLoaded), // name is generated
            slotsUsed,
            slotsProvided, 
            roundsLoaded,
        );
        // #TODO: Set the name via this.formatRoundsLoaded();
    }
    
    // @Override
    public getMass():number {
        let ammoMass:number = 0;
        let ammoAvailable:Bag<AmmoType> = this.internalResourceProvider.getAllAvailableResources();
        // Get the distinct ammo types
        for (let ammoType of ammoAvailable.toSet().toArray()) {
            // For each ammo type, sum the mass of that ammo type
            ammoMass += ammoType.mass * ammoAvailable.count(ammoType);
        }

        // Total mass of an ammo box is the mass of the ammobox plus the ammo inside
        return this.data.getMass() + ammoMass;
    }

    private static nameFromRoundsLoaded(roundsLoaded:[[string, number]]):string {
        let ammoClasses:Map<string, AmmoClass> = AmmoClass.getAmmoClassMap();

        let result:string[] = [];
        for (let loading of roundsLoaded) {
            result.push(`${loading[1]}x ${ammoClasses.get(loading[0]).name}`);
        }
        return `Ammo Storage (${result.join(", ")})`;
    }
}

export class LoaderSerialization {

    public static readonly PREFIX:string = "loader_";

    constructor(
        public id:string, // must be globally unique
        public name:string,
        public mass:number, // kg
        public passivePowerDraw:number, // watts
        public activePowerDraw:number, //watts

        public slotsUsed:string[], 
        public slotsProvided:string[],

        public ammoClasses:string[],
        public maxLoadedRounds,

        public reloadRate:number, // number of times loader activates per second
        public reloadQuantity:number // number of rounds loaded per activation
    ) {
    }
}

export class Loader extends ActivateableComponent implements IHaveResource<AmmoType>, IUseResource<AmmoType> {

    public static readonly PREFIX:string = "loader_";

    private internalAmmoConsumer:IUseResource<AmmoType>;
    private internalAmmoProvider:IHaveResource<AmmoType>;

    public readonly maxLoadedRounds:number;

    private compatibleAmmoTypes:Set<AmmoType>;

    constructor(
        id:string, // must be globally unique
        name:string,
        mass:number, // kg
        passivePowerDraw:number, // watts
        activePowerDraw:number, //watts

        private slotsUsed:string[], 
        private slotsProvided:string[],

        ammoClasses:string[],
        maxLoadedRounds,

        public reloadRate:number, // number of times loader activates per second
        public reloadQuantity:number // number of rounds loaded per activation
    ) {
        super(
            id, name,
            new SlotConsumer(slotsUsed),
            new SlotProvider(slotsProvided), 
            new ActivateableResourceData(mass, passivePowerDraw, activePowerDraw)
        );
        this.maxLoadedRounds = maxLoadedRounds;
        this.compatibleAmmoTypes = new Set<AmmoType>();
        
        let ammoTypeMap:Map<string, AmmoType> = <Map<string, AmmoType>> AmmoType.getClassMap();
        for (let compatibleAmmoType of ammoClasses) {
            this.compatibleAmmoTypes.add(ammoTypeMap.get(compatibleAmmoType));
        }

        this.internalAmmoConsumer = new ResourceConsumer<AmmoType>([], null);
        this.internalAmmoProvider = new ResourceProvider<AmmoType>([]);
    }

    public getAllAvailableResources():Bag<AmmoType> {
        return this.internalAmmoProvider.getAllAvailableResources();
    }

    public getAvailableResource(ammoType:AmmoType):number {
        return this.internalAmmoProvider.getAvailableResource(ammoType);
    }

    public supplyResource(ammoType:AmmoType, roundsRequested:number):number {
        return this.internalAmmoProvider.supplyResource(ammoType, roundsRequested);
    }

    public getResourceType():AmmoType {
        return this.internalAmmoConsumer.getResourceType();
    }

    public setResourceType(ammoType:AmmoType):boolean {
        if (this.compatibleAmmoTypes.has(ammoType)) {
            return this.internalAmmoConsumer.setResourceType(ammoType);
        }
        return true;
    }

    public getResourceProviders():IHaveResource<AmmoType>[] {
        return this.internalAmmoConsumer.getResourceProviders();
    }

    public addResourceProvider(ammoSource:IHaveResource<AmmoType>):boolean {
        return this.internalAmmoConsumer.addResourceProvider(ammoSource);
    }

    public removeResourceProvider(ammoSource:IHaveResource<AmmoType>):boolean {
        return this.internalAmmoConsumer.removeResourceProvider(ammoSource);
    }

    public consumeResource(roundsRequested:number):number {
        return this.internalAmmoConsumer.consumeResource(roundsRequested);
    }

    public getTickRate():number {
        return this.reloadRate;
    }

    public activate():void {
        this.consumeResource(this.maxLoadedRounds - this.internalAmmoProvider.getAvailableResource(this.getResourceType()));
    }

    static fromJSON(serialized:LoaderSerialization): Loader {
        return new Loader(
            serialized.id,
            serialized.name,
            serialized.mass,
            serialized.passivePowerDraw,
            serialized.activePowerDraw,
            serialized.slotsUsed,
            serialized.slotsProvided,
            serialized.ammoClasses,
            serialized.maxLoadedRounds,
            serialized.reloadRate,
            serialized.reloadQuantity
        );
    }
}

let jsonFiles = new StaticTextCollection(path.join(__dirname, "assets", "data"));
console.log(JSON.stringify(
    [
        new LoaderSerialization("loader_cannon_belt", "Belt Feed (30mm)", 0, 0, 0, ["slot_loader_cannon"], [], ["ammo_030x173mm_shell"], 1, 0, 1),
        new LoaderSerialization("loader_cannon_heavy_Mk7_lightSingle", "Mk7 Cannon Autoloader System", 80, 0, 300, ["slot_loader_cannon"], [], ["ammo_030x173mm_shell"], 4, 5.56, 1),
        new LoaderSerialization("loader_cannon_heavy_Mk7_lightDual", "Mk7 Cannon Autoloader System (Dual-Feed)", 130, 0, 550, ["slot_loader_cannon"], [], ["ammo_030x173mm_shell"], 8, 4.17, 2),
        new LoaderSerialization("loader_cannon_heavy_Mk8_medium", "Mk8 Midweight Autoloader", 300, 0, 700, ["slot_loader_cannon"], [], ["ammo_113x1238mm", "ammo_155x300mm_railgun"], 18, 0.5, 1),
        new LoaderSerialization("loader_cannon_heavy_Mk9_heavy", "Mk9 Heavy Autoloader", 650, 0, 1200, ["slot_loader_cannon"], [], ["ammo_113x1238mm", "ammo_155x300mm_railgun"], 10, 1, 1),
        
        new LoaderSerialization("loader_machinegun_belt", "Belt Feed (12.7mm)", 0, 0, 0, ["slot_loader_machinegun"], [], ["ammo_012x099mm"], 1, 0, 1),
    ]
));