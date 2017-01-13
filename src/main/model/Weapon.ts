/// <reference path="../../../typings/index.d.ts" />
/// <reference path="../../../node_modules/excalibur/dist/excalibur.d.ts" />

import { Identifiable } from "./General";
import { Entity } from "../Entity";
import { EquipmentBase, Equippable, EquippableData } from "./Equippable";
import { AmmoData } from "./Ammo";

export class WeaponData extends Identifiable {

    constructor(
        public basicData:EquippableData,

        public ammoType:string,
        
        public fireRate:number, // rounds per second
        public accuracy:number, // minutes of arc
        public recoil:number,
        public heatLimit:number // after this limit is exceeded, weapon stops firing
        ) {
            super(basicData.id, basicData.name)
        }

}

/**
 * An instance of the weapon in-game. Has physics interactions and can be drawn on screen.
 */
export abstract class WeaponEntity extends EquipmentBase {
    
    protected weaponData:WeaponData;
    protected entity:Entity;

    constructor(weaponData:WeaponData, entity:Entity) {
        super(weaponData.basicData);
        this.weaponData = weaponData;
        this.entity = entity;
    }

}