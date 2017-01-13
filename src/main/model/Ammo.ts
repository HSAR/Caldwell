/// <reference path="../../../typings/index.d.ts" />

import { Identifiable } from "./General";
import { Entity } from "../Entity";
import { EquipmentBase, Equippable, EquippableData } from "./Equippable";

export class AmmoData extends Identifiable {

    constructor(
        public id:string, // must be globally unique
        public name:string,

        public ammoType:string,
        public mass:number, // kg
        public firingHeat:number
        ) {
            super(id, name);
        }

}

export class AmmoSupplyData extends Identifiable {

    constructor(
        public id:string, // must be globally unique
        public name:string,

        public basicData:EquippableData,

        public ammoType:string,
        public reloadType:ReloadType,
        public reloadRate:number // number of rounds/magazines reloaded per second
        ) {
            super(id, name);
        }
    
}

export enum ReloadType {
    Magazine, // Weapon may fire N rounds at maximum fire rate, then stops until entire magazine is replaced.
    Pool, // Weapon may fire N rounds at maximum fire rate, then is limited by loader supply rate. Pool refills if not full, even if weapon is not firing.
    Belt, // Weapon is limited by loader supply rate. N rounds are held "in the belt".
}

export class AmmoSupply extends EquipmentBase {
    
    protected ammoSupplyData:AmmoSupplyData;
    protected entity:Entity;

    constructor(ammoSupplyData:AmmoSupplyData, entity:Entity) {
        super(ammoSupplyData.basicData);
        this.ammoSupplyData = ammoSupplyData;
        this.entity = entity;
    }

}