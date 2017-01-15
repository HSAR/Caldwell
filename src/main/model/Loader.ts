/// <reference path="../../../typings/index.d.ts" />

import { Bag } from 'typescript-collections';

import { Entity } from "../Entity";
import { ActivateableComponent, ActivateableResourceData, ComponentBase, ResourceData, SlotConsumer, SlotProvider } from "./Equippable";
import { AmmoType } from "./Ammo";

export enum ReloadType {
    Magazine, // Weapon may fire N rounds at maximum fire rate, then stops until entire magazine is replaced.
    Pool, // Weapon may fire N rounds at maximum fire rate, then is limited by loader supply rate. Pool refills if not full, even if weapon is not firing.
    Belt, // Weapon is limited by loader supply rate. N rounds are held "in the belt".
}

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
     * Load roundsLoaded rounds. Returns the number of rounds actually loaded.
     */
    loadRounds(roundsRequested:number):number;
}

export class AmmoProvider implements IHaveAmmo {

    private roundsLoaded:Bag<AmmoType> = new Bag<AmmoType>();

    constructor(
        roundsToLoad:[[string, number]] // Multiple types can be supported. [["ammo_012x099mm", 100], ["ammo_030x173mm_shell", 10]] 
    ) {
        for (let ammoType of roundsToLoad) {
            this.roundsLoaded.add(ammoType[0], ammoType[1]);
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

    public loadRounds(roundsRequested:number):number {
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

        public compatibleAmmoTypes:string[],
        public maxLoadedRounds,

        public reloadType:ReloadType,
        public reloadRate:number, // number of times loader activates per second
        public reloadQuantity:number // number of rounds loaded per activation
    ) {
    }
}

export class Loader extends ActivateableComponent implements IHaveAmmo, IUseAmmo {

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

        compatibleAmmoTypes:string[],
        maxLoadedRounds,

        public reloadType:ReloadType,
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
        this.compatibleAmmoTypes = new Set(compatibleAmmoTypes);
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

    public loadRounds(roundsRequested:number):number {
        return this.internalAmmoConsumer.loadRounds(roundsRequested);
    }

    public getTickRate():number {
        return this.reloadRate;
    }

    public activate():void {
        this.loadRounds(this.maxLoadedRounds - this.internalAmmoProvider.getAvailableRounds(this.getAmmoType()));
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
            serialized.compatibleAmmoTypes,
            serialized.maxLoadedRounds,
            serialized.reloadType,
            serialized.reloadRate,
            serialized.reloadQuantity
        );
    }
}

export class

console.log(JSON.stringify(
    [
        new LoaderSerialization("loader_cannon_light_belt", "Canister Belt Feed", 80, 0, 300, ["slot_loader_cannon"], [], ["ammo_030x173mm_shell"], ReloadType.Belt, 0.2),
        new LoaderSerialization("loader_cannon_heavy_Mk7_lightSingle", "Mk7 Cannon Autoloader System", 80, 0, 300, ["slot_loader_cannon"], [], ["ammo_030x173mm_shell"], ReloadType.Belt, 0.18),
        new LoaderSerialization("loader_cannon_heavy_Mk7_lightDual", "Mk7 Cannon Autoloader System (Dual-Feed)", 130, 0, 550, ["slot_loader_cannon"], [], ["ammo_030x173mm_shell"], ReloadType.Belt, 0.3),
        new LoaderSerialization("loader_cannon_heavy_Mk8_heavy", "Mk8 Turret Autoloader", 650, 0, 1200, ["slot_loader_cannon"], [], ["ammo_155x300mm_railgun"], ReloadType.Belt, 0.3),
        
        new LoaderSerialization("weapon_autocannon_30mm_Mk44", "Mk44 Bushmaster II 30mm autocannon", 160, 0, 750, ["slot_weapon_cannon"], ["slot_loader_autocannon"], "ammo_030x173mm_shell", 3.33, 8.6, 200000, 50),
        new LoaderSerialization("weapon_railgun_25MW_M213_standalone", "M213 Recurve 25MW railgun", 57000, 0, 25000000,  ["slot_weapon_cannon"], ["slot_loader_railgun"], "ammo_155x300mm_railgun", 0.1, 1.5, 33000000, 200),
        new LoaderSerialization("weapon_railgun_25MW_M213_assisted", "M213 Recurve 25MW railgun (reactor-assisted)", 57100, 0, 25000000,  ["slot_weapon_railgun"], ["slot_reactor_small"], "ammo_155x300mm_railgun", 0.1, 1.5, 33000000, 200),
        new LoaderSerialization("weapon_machinegun_12.7mm_M2", "M2 Browning heavy machine gun", 38, 0, 0, ["slot_weapon_machinegun"], [], "ammo_012x099mm", 15, 0.7, 11100, 25)
    ]
));