/// <reference path="../../../typings/index.d.ts" />

import { IIdentifiable } from "./General";
import { Entity } from "../Entity";
import { ComponentBase, ResourceData } from "./Equippable";
import { Resource } from "./Resource";

import { StaticTextCollection } from "../util/StaticTextCollection";

export class FuelSerializable {

    constructor(
        public id:string, // must be globally unique
        public name:string,
        public mass:number, // kg
    ) {
    }

}

/**
 * Ammunition resource is consumed by weapons.
 */
export class FuelType extends Resource {

    public static readonly PREFIX:string = "fuelType";

    constructor(
        id:string, // must be globally unique
        name:string,
        public mass:number, // kg

    ) {
        super(id, name);
    }

    public static fromJSON(serialized:FuelSerializable): FuelType {
        return new FuelType(
            serialized.id,
            serialized.name,
            serialized.mass,
        );
    }
}