/// <reference path="../../../typings/index.d.ts" />

import { IIdentifiable } from "./General";
import { Entity } from "../Entity";
import { ComponentBase, ResourceData } from "./Equippable";

import { StaticTextCollection } from "../util/StaticTextCollection";

export class AmmoClass {

    public static readonly PREFIX:string = "ammoClass_";

    constructor(
        public id:string, // must be globally unique
        public name:string,
        //public mass:number, // kg

        //public firingHeat:number,

        //public damage:number,
        //public radius:number
    ) {
    }

    private static getAmmoClassMappings():[string, any][] {
        return Array.from(StaticTextCollection.getObjectsById())
            .filter((idToObjectMapping:[string, any]) => {
                return idToObjectMapping[0].startsWith(AmmoClass.PREFIX);
            });
    }

    public static getAmmoClassMap():Map<string, AmmoClass> {
        return new Map<string, AmmoClass>(AmmoClass.getAmmoClassMappings());
    };

    public static getAmmoClasses():AmmoClass[] {
        return AmmoClass.getAmmoClassMappings().map(StaticTextCollection.mappingToValue);
    };

}

export class AmmoType {

    public static readonly PREFIX:string = "ammoType_";

    constructor(
        public id:string, // must be globally unique
        public name:string,
        public mass:number, // kg

        public ammoClass:string,
        public firingHeat:number,

        public damage:number,
        public radius:number
    ) {
    }

    private static getAmmoTypeMappings():[string, any][] {
        return Array.from(StaticTextCollection.getObjectsById())
            .filter((idToObjectMapping:[string, any]) => {
                
                return idToObjectMapping[0].startsWith(AmmoType.PREFIX);
            });
    }

    public static getAmmoTypeMap():Map<string, AmmoType> {
        return new Map<string, AmmoType>(AmmoType.getAmmoTypeMappings());
    };

    public static getAmmoTypes():AmmoType[] {
        return AmmoType.getAmmoTypeMappings().map(StaticTextCollection.mappingToValue);
    };

    public static getAmmoTypesFilteredByClass(ammoClass:string):AmmoType[] {
        return AmmoType.getAmmoTypes().filter((ammoType:AmmoType) => {
            return ammoType.ammoClass == ammoClass;
        })
    }

    public static fromJSON(serialized:AmmoType): AmmoType {
        return new AmmoType(
            serialized.id,
            serialized.name,
            serialized.mass,
            serialized.ammoClass,
            serialized.firingHeat,
            serialized.damage,
            serialized.radius
        );
    }
}

console.log(JSON.stringify( // new radius = (old radius / (old explosive charge ^ 1/3)) * (new explosive charge ^ 1/3)
    [
        new AmmoType("ammoType_012x099mm_AP", "12.7mm M2 Armour-Piercing (AP)", 0.115, "ammoClass_012x099mm", 1, 900, 2),
        new AmmoType("ammoType_012x099mm_polymer", "12.7mm Mk323 Polymer-Cased Ball", 0.086, "ammoClass_012x099mm", 1, 900, 2),
        new AmmoType("ammoType_030x173mm_HEAB", "Mk310 30mm High Explosive Air-Burst (HEAB-T)", 0.86, "ammoClass_030x173mm", 1, 6, 10), // ~0.04kg warhead
        new AmmoType("ammoType_030x173mm_APFSDS", "Mk258 30mm Armour-Piercing (APFSDS-T)", 0.86, "ammoClass_030x173mm", 1, 9, 1),
        new AmmoType("ammoType_113x1238mm", "4.5-inch High Explosive (HE)", 36.5, "ammoClass_113x1238mm", 1, 200, 97), // ~36.5kg warhead
        new AmmoType("ammoType_155x300mm_railgun_slug", "155mm Ferrous Railgun Projectile", 3.2, "ammoClass_155x300mm_railgun", 1, 900, 2),
    ]
));

console.log(JSON.stringify(
    [
        new AmmoClass("ammoClass_012x099mm", "12.7mm BMG"),
        new AmmoClass("ammoClass_030x173mm", "30mm"),
        new AmmoClass("ammoClass_113x1238mm", "113mm 4.5\""),
        new AmmoClass("ammoClass_155x300mm_railgun", "155mm FRP"),
    ]
));