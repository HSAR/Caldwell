/// <reference path="../../../typings/index.d.ts" />
/// <reference path="../../../node_modules/excalibur/dist/excalibur.d.ts" />

import { Entity } from "../Entity";
import { EquipmentBase, Equippable } from "./Equippable";
import { AmmoType, AmmoSupplyType } from "./Ammo";

export class Weapon extends Equippable {

    public EquipmentProperties;

    public ammoType:string;
    
    public fireRate:number; // rounds per second
    public accuracy:number; // minutes of arc
    public recoil:number;
    public heatLimit:number; // after this limit is exceeded; weapon stops firing

}

export abstract class WeaponEntity {
    
    protected entity:Entity;

    public Weapon(entity:Entity, weaponProperties) {
        this.entity = entity;
    }

}