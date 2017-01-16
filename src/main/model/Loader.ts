/// <reference path="../../../typings/index.d.ts" />

import { Bag } from 'typescript-collections';
import * as path from "path";

import { Entity } from "../Entity";
import { ActivateableComponent, ActivateableResourceData, ComponentBase, ResourceData, SlotConsumer, SlotProvider } from "./Equippable";
import { AmmoType } from "./Ammo";

import { StaticTextCollection } from "../util/StaticTextCollection";

export interface IHaveAmmo {

    /**
     * Returns all rounds currently available for immediate feeding.
     */
    getAllAvailableRounds():Bag<AmmoType>;

    /**
     * Returns the number of rounds of a certain type currently available for immediate feeding.
     */
    getAvailableRounds(ammoType:AmmoType):number;

    /**
     * Request roundsRequested rounds of type ammoType. Returns the number of rounds actually supplied.
     */
    requestRounds(ammoType:AmmoType, roundsRequested:number):number;

}

export interface IUseAmmo {

    /**
     * Gets the ammo type currently being drawn.
     */
    getAmmoType():AmmoType;

    /**
     * Set the component to use this type of ammo. Returns true if successful.
     */
    setAmmoType(ammoType:AmmoType):boolean;

    getAmmoSources():IHaveAmmo[];

    addAmmoSource(ammoSource:IHaveAmmo):boolean;

    removeAmmoSource(ammoSource:IHaveAmmo):boolean;

    /**
     * Consume roundsRequested rounds from attached ammo sources. Returns the number of rounds actually fed.
     */
    consumeRounds(roundsRequested:number):number;
}

export class AmmoProvider implements IHaveAmmo {

    private roundsLoaded:Bag<AmmoType> = new Bag<AmmoType>();

    constructor(
        roundsToLoad:[string, number][] // Multiple types can be supported. [["ammo_012x099mm", 100], ["ammo_030x173mm_shell", 10]] 
    ) {
        let ammoTypes:Map<string, AmmoType> = AmmoType.getAmmoTypeMap();
        for (let ammoType of roundsToLoad) {
            this.roundsLoaded.add(ammoTypes.get(ammoType[0]), ammoType[1]);
        }
    }

    getAllAvailableRounds():Bag<AmmoType> {
        return this.roundsLoaded;
    }

    getAvailableRounds(ammoType:AmmoType):number {
        return this.getAllAvailableRounds().count(ammoType);
    }

    requestRounds(ammoType:AmmoType, roundsRequested:number):number {
        // If 5 rounds and 45 are requested, serve 5
        let roundsServed = Math.min(this.getAllAvailableRounds().count(ammoType), roundsRequested);

        this.roundsLoaded.remove(ammoType, roundsServed);
        return roundsServed;
    }
}

export class AmmoConsumer implements IUseAmmo {
    constructor(
        private ammoSources:IHaveAmmo[], // implemented as a list to preserve priority
        private ammoType:AmmoType
    ) {
    }

    public getAmmoType():AmmoType {
        return this.ammoType;
    }

    public setAmmoType(ammoType:AmmoType):boolean {
        this.ammoType = ammoType;
        return true;
    }

    public getAmmoSources():IHaveAmmo[] {
        return this.ammoSources.slice(0);
    }

    public addAmmoSource(ammoSource:IHaveAmmo):boolean {
        this.ammoSources.push(ammoSource);
        return true;
    }

    public removeAmmoSource(ammoSource:IHaveAmmo):boolean {
        let index = this.ammoSources.indexOf(ammoSource)
        if (index > -1) {
            this.ammoSources.splice(index, 1);
            return true;
        }
        return false;
    }

    /**
     * Request rounds from ammo sources attached to this AmmoConsumer.
     * Returns the actual number of rounds consumed.
     */
    public consumeRounds(roundsRequested:number):number {
        let roundsServed = 0;
        for (let ammoSource of this.ammoSources) {
            roundsServed += ammoSource.requestRounds(this.ammoType, roundsRequested - roundsServed);
            if (roundsServed == roundsRequested) {
                return roundsServed;
            }
        }

        return roundsServed;
    }
    
}

export class AmmoBox extends ComponentBase implements IHaveAmmo {

    private internalAmmoProvider:IHaveAmmo

    constructor(
        id:string, // must be globally unique
        name:string,
        mass:number, // kg
        passivePowerDraw:number, // watts

        private slotsUsed:string[], 
        private slotsProvided:string[],

        roundsLoaded:[[string, number]] // Multiple types can be supported. [["ammo_012x099mm", 100], ["ammo_030x173mm_shell", 10]] 
    ) {
        super(
            id, name,
            new SlotConsumer(slotsUsed),
            new SlotProvider(slotsProvided), 
            new ResourceData(mass, passivePowerDraw)
        );
        this.internalAmmoProvider = new AmmoProvider(roundsLoaded);
    }
    
    // @Override
    public getMass():number {
        // Mass of an ammo box is the mass of the box plus ammo within
        let ammoMass = 0;
        for (let ammoType of this.internalAmmoProvider.getAllAvailableRounds().toArray()) {
            ammoMass += ammoType.mass;
        }
        return this.data.getMass() + ammoMass;
    }

    public getAllAvailableRounds():Bag<AmmoType> {
        return this.internalAmmoProvider.getAllAvailableRounds();
    }

    public getAvailableRounds(ammoType:AmmoType) {
        return this.internalAmmoProvider.getAvailableRounds(ammoType);
    }

    public requestRounds(ammoType:AmmoType, roundsRequested:number):number {
        return this.internalAmmoProvider.requestRounds(ammoType, roundsRequested);
    }
}

export class LoaderSerialization {

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

export class Loader extends ActivateableComponent implements IHaveAmmo, IUseAmmo {

    public static readonly PREFIX:string = "loader_";

    private internalAmmoConsumer:IUseAmmo;
    private internalAmmoProvider:IHaveAmmo;

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
        
        let ammoTypeMap:Map<string, AmmoType> = AmmoType.getAmmoTypeMap();
        for (let compatibleAmmoType of ammoClasses) {
            this.compatibleAmmoTypes.add(ammoTypeMap.get(compatibleAmmoType));
        }
    }

    public getAllAvailableRounds():Bag<AmmoType> {
        return this.internalAmmoProvider.getAllAvailableRounds();
    }

    public getAvailableRounds(ammoType:AmmoType):number {
        return this.internalAmmoProvider.getAvailableRounds(ammoType);
    }

    public requestRounds(ammoType:AmmoType, roundsRequested:number):number {
        return this.internalAmmoProvider.requestRounds(ammoType, roundsRequested);
    }

    public getAmmoType():AmmoType {
        return this.internalAmmoConsumer.getAmmoType();
    }

    public setAmmoType(ammoType:AmmoType):boolean {
        if (this.compatibleAmmoTypes.has(ammoType)) {
            return this.internalAmmoConsumer.setAmmoType(ammoType);
        }
        return true;
    }

    public getAmmoSources():IHaveAmmo[] {
        return this.internalAmmoConsumer.getAmmoSources();
    }

    public addAmmoSource(ammoSource:IHaveAmmo):boolean {
        return this.internalAmmoConsumer.addAmmoSource(ammoSource);
    }

    public removeAmmoSource(ammoSource:IHaveAmmo):boolean {
        return this.internalAmmoConsumer.removeAmmoSource(ammoSource);
    }

    public consumeRounds(roundsRequested:number):number {
        return this.internalAmmoConsumer.consumeRounds(roundsRequested);
    }

    public getTickRate():number {
        return this.reloadRate;
    }

    public activate():void {
        this.consumeRounds(this.maxLoadedRounds - this.internalAmmoProvider.getAvailableRounds(this.getAmmoType()));
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