/// <reference path="../../../typings/index.d.ts" />
/// <reference path="../../../node_modules/excalibur/dist/excalibur.d.ts" />
///<reference path="General.ts"/>

import { Identifiable } from "./General";
import { Entity } from "../Entity";
import { ItemBase, Resourceable, ResourceData, SlotConsumer, SlotProvider } from "./Equippable";
import { AmmoData } from "./Ammo";

export class Weapon extends ItemBase {

    constructor(
        id:string, // must be globally unique
        name:string,
        mass:number, // kg
        energyDraw:number, // watts

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
            new ResourceData(mass, energyDraw)
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
        new Weapon("weapon_autocannon_30mm_Mk44", "Mk44 Bushmaster II 30mm autocannon", 160, 750, ["slot_weapon_autocannon"], ["slot_loader_autocannon"], "ammo_030x173mm_shell", 3.33, 8.6, 200000, 50),
        new Weapon("weapon_railgun_25MW_M213_standalone", "M213 Recurve 25MW railgun", 57000, 25000000,  ["slot_weapon_railgun"], [], "ammo_155x300mm_railgun", 0.1, 1.5, 33000000, 200),
        new Weapon("weapon_railgun_25MW_M213_assisted", "M213 Recurve 25MW railgun (reactor-assisted)", 57100, 25000000,  ["slot_weapon_railgun"], ["slot_reactor_small"], "ammo_155x300mm_railgun", 0.1, 1.5, 33000000, 200),
        new Weapon("weapon_machinegun_12.7mm_M2", "M2 .50 HMG", 38, 0, ["slot_weapon_machinegun"], [], "ammo_012x099mm", 15, 0.7, 11100, 25)
    ]
));