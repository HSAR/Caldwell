/// <reference path="../../../typings/index.d.ts" />
/// <reference path="../../../node_modules/excalibur/dist/excalibur.d.ts" />
///<reference path="General.ts"/>

import { Entity } from "../Entity";
import { ActivateableComponent, ActivateableResourceData, SlotConsumer, SlotProvider } from "./Equippable";
import { IUseAmmo, IHaveAmmo } from "./Loader";

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

export /*abstract*/ class Weapon extends ActivateableComponent {

    constructor(
        id:string, // must be globally unique
        name:string,
        mass:number, // kg
        passivePowerDraw:number, // watts
        activePowerDraw:number, //watts

        private slotsUsed:string[], 
        private slotsProvided:string[],

        public ammoType:string,
        
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
    }

    /*protected abstract fire(timesToFire:number):void; */

    public getTickRate():number {
        return this.fireRate;
    }

    // @Override
    public tick(timeSinceLastTick:number):void {
        // #TODO: Figure out what to do here
        //this.fire(1);
        return;
    }

    static fromJSON(serialized:WeaponSerialization): Weapon {
        let user = Object.create(Weapon.prototype);
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
        protected data:Weapon,
        protected entity:Entity) {
    }

}

console.log(JSON.stringify(
    [
        new WeaponSerialization("weapon_autocannon_30mm_Mk44", "Mk44 Bushmaster II 30mm autocannon", 160, 0, 750, ["slot_weapon_cannon"], ["slot_loader_cannon"], "ammo_030x173mm_shell", 3.33, 8.6, 200000, 50),
        new WeaponSerialization("weapon_railgun_25MW_M213_standalone", "M213 Recurve 25MW railgun", 57000, 0, 25000000,  ["slot_weapon_cannon"], ["slot_loader_railgun"], "ammo_155x300mm_railgun", 0.1, 1.5, 33000000, 200),
        new WeaponSerialization("weapon_railgun_25MW_M213_assisted", "M213 Recurve 25MW railgun (reactor-assisted)", 57100, 0, 25000000,  ["slot_weapon_railgun"], ["slot_reactor_small"], "ammo_155x300mm_railgun", 0.1, 1.5, 33000000, 200),
        new WeaponSerialization("weapon_machinegun_12.7mm_M2", "M2 Browning heavy machine gun", 38, 0, 0, ["slot_weapon_machinegun"], [], "ammo_012x099mm", 15, 0.7, 11100, 25)
    ]
));