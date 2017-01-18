/// <reference path="../../../typings/index.d.ts" />
/// <reference path="../../../node_modules/excalibur/dist/excalibur.d.ts" />
///<reference path="General.ts"/>

import { Entity } from "../Entity";
import { ActivateableComponent, ActivateableResourceData, SlotConsumer, SlotProvider } from "./Equippable";
import { AmmoType } from "./Ammo";
import { ResourceConsumer, ResourceProvider, IUseResource, IHaveResource } from "./Resource";

import { StaticTextCollection } from "../util/StaticTextCollection";

export class WeaponSerialization {

    constructor(
        public id:string, // must be globally unique
        public name:string,
        public mass:number, // kg
        public passivePowerDraw:number, // watts
        public activePowerDraw:number, //watts

        public slotsUsed:string[], 
        public slotsProvided:string[],

        public ammoType:string,
        
        public fireRate:number, // rounds per second
        public accuracy:number, // minutes of arc
        public recoil:number,
        public heatLimit:number // after this limit is exceeded, weapon stops firing
    ) {
    }
}

export /*abstract*/ class Weapon extends ActivateableComponent implements IUseResource<AmmoType> {

    public static readonly PREFIX:string = "weapon_";

    private internalAmmoConsumer:IUseResource<AmmoType>;

    constructor(
        id:string, // must be globally unique
        name:string,
        mass:number, // kg
        passivePowerDraw:number, // watts
        activePowerDraw:number, //watts

        private slotsUsed:string[], 
        private slotsProvided:string[],

        public ammoClass:string,
        
        public fireRate:number, // rounds per second
        public accuracy:number, // minutes of arc
        public recoil:number,
        public heatLimit:number // after this limit is exceeded, weapon stops firing
    ) {
        super(
            id, 
            name,
            new SlotConsumer(slotsUsed),
            new SlotProvider(slotsProvided), 
            new ActivateableResourceData(mass, passivePowerDraw, activePowerDraw)
        );
        this.internalAmmoConsumer = new ResourceConsumer([], AmmoType.getAmmoTypesFilteredByClass(ammoClass)[0]);
    }

    /*protected abstract fire(timesToFire:number):void; */

    public getTickRate():number {
        return this.fireRate;
    }

    public activate():void {
        if (this.internalAmmoConsumer.consumeResource(1) < 1) {
            // TODO: *click*
            return;
        }
        // TODO: Fire!
    }

    public getResourceType():AmmoType {
        return this.internalAmmoConsumer.getResourceType();
    }

    public setResourceType(ammoType:AmmoType):boolean {
        // Weapons cannot change their ammo class (this may change)
        if (this.ammoClass != ammoType.ammoClass) {
            return false;
        }

        return this.internalAmmoConsumer.setResourceType(ammoType);
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

    static fromJSON(serialized:WeaponSerialization): Weapon {
        return new Weapon(
            serialized.id,
            serialized.name,
            serialized.mass,
            serialized.passivePowerDraw,
            serialized.activePowerDraw,
            serialized.slotsUsed,
            serialized.slotsProvided,
            serialized.ammoType,
            serialized.fireRate,
            serialized.accuracy,
            serialized.recoil,
            serialized.heatLimit
        );
    }
}

/**
 * An instance of the weapon in-game. Has physics interactions and can be drawn on screen.
 */
export class WeaponEntity {
    
    constructor(
        protected weapon:Weapon,
        protected entity:Entity) {
    }

}

console.log(JSON.stringify(
    [
        new WeaponSerialization("weapon_autocannon_30mm_Mk44", "Mk44 Bushmaster II 30mm autocannon", 160, 0, 750, ["slot_weapon_light_cannon"], ["slot_loader_cannon"], "ammo_030x173mm", 3.33, 8.6, 200000, 50),
        new WeaponSerialization("weapon_railgun_25MW_M213_standalone", "M213 Recurve 25MW railgun", 57000, 0, 25000000,  ["slot_weapon_heavy_cannon"], ["slot_loader_cannon"], "ammo_155x300mm_railgun", 0.1, 1.5, 33000000, 200),
        new WeaponSerialization("weapon_railgun_25MW_M213_assisted", "M213 Recurve 25MW railgun (reactor-assisted)", 57100, 0, 25000000,  ["slot_weapon_heavy_cannon"], ["slot_loader_railgun", "slot_reactor_small"], "ammo_155x300mm_railgun", 0.1, 1.5, 33000000, 200),
        new WeaponSerialization("weapon_machinegun_12.7mm_M2", "M2 Browning heavy machine gun", 38, 0, 0, ["slot_weapon_machinegun"], ["slot_loader_machinegun"], "ammo_012x099mm", 15, 0.7, 11100, 25),
        new WeaponSerialization("weapon_cannon_113mm_Mk8", "Mk8 4.5-inch Naval Gun", 2400, 0, 18080, ["slot_weapon_medium_cannon"], [], "ammo_113x1238mm", 0.4, 1.76, 8000000, 25)
    ]
));