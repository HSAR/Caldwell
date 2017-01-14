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
}

export class AmmoSupply extends ComponentBase {
    
    protected ammoSupplyData:AmmoSupplyData;
    protected entity:Entity;

    constructor(ammoSupplyData:AmmoSupplyData, entity:Entity) {
        super(ammoSupplyData.basicData);
        this.ammoSupplyData = ammoSupplyData;
        this.entity = entity;
    }

}