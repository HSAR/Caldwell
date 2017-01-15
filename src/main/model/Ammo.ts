/// <reference path="../../../typings/index.d.ts" />

import { IIdentifiable } from "./General";
import { Entity } from "../Entity";
import { ComponentBase, ResourceData } from "./Equippable";

export class AmmoType {

    constructor(
        public id:string, // must be globally unique
        public name:string,
        public mass:number, // kg

        public ammoType:string,
        public firingHeat:number,

        public damage:number,
        public radius:number
    ) {
    }

    static fromJSON(serialized:AmmoType): AmmoType {
        return new AmmoType(
            serialized.id,
            serialized.name,
            serialized.mass,
            serialized.ammoType,
            serialized.firingHeat,
            serialized.damage,
            serialized.radius
        );
    }
}


console.log(JSON.stringify(
    [
        new AmmoType("ammo_030x173mm_HEAB", "Mk310 30mm High Explosive Air-Burst (HEAB-T)", 0.86, "ammo_030x173mm", 1, 3, 15),
        new AmmoType("ammo_030x173mm_APFSDS", "Mk258 30mm Armour-Piercing (APFSDS-T)", 0.86, "ammo_030x173mm", 1, 9, 1),
        new AmmoType("ammo_155x300mm_railgun_slug", "155mm Ferrous Railgun Projectile", 3.2, "ammo_155x300mm_railgun", 1, 900, 2),
        new AmmoType("ammo_012x099mm_AP", "12.7mm M2 Armour-Piercing (AP)", 0.115, "ammo_012x099mm", 1, 900, 2),
        new AmmoType("ammo_012x099mm_polymer", "12.7mm Mk323 Polymer-Cased Ball", 0.086, "ammo_012x099mm", 1, 900, 2)
    ]
));