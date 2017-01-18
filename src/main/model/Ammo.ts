/// <reference path="../../../typings/index.d.ts" />

import { Bag } from 'typescript-collections';

import { IIdentifiable } from "./General";
import { Entity } from "../Entity";
import { ComponentBase, ResourceData } from "./Equippable";
import { IHaveResource, IUseResource, Resource, ResourceProvider, ResourceConsumer, ResourceStorage } from './Resource';

import { StaticTextCollection } from "../util/StaticTextCollection";

export class AmmoClass {

    public static readonly PREFIX:string = "ammoClass_";

    constructor(
        public id:string, // must be globally unique
        public name:string,
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

export class AmmoTypeSerializable {

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

}

export class AmmoType extends Resource {

    public static readonly PREFIX:string = "ammoType_";

    constructor(
        id:string, // must be globally unique
        name:string,
        public mass:number, // kg

        public ammoClass:string,
        public firingHeat:number,

        public damage:number,
        public radius:number
    ) {
        super(id, name);
    }

    public static getAmmoTypesFilteredByClass(ammoClass:string):AmmoType[] {
        return (<AmmoType[]> AmmoType.getClassList()).filter((ammoType:AmmoType) => {
            return ammoType.ammoClass == ammoClass;
        })
    }

    public static fromJSON(serialized:AmmoTypeSerializable): AmmoType {
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

export class AmmoBox extends ResourceStorage<AmmoType> implements IHaveResource<AmmoType> {

    constructor(
        id:string, // must be globally unique
        name:string,

        slotsUsed:string[], 
        slotsProvided:string[],

        roundsLoaded:[[string, number]] // Multiple types can be supported. [["ammo_012x099mm", 100], ["ammo_030x173mm_shell", 10]] 
    ) {
        super(
            "storage_ammo",  // ammo boxes are currently singletons
            AmmoBox.nameFromRoundsLoaded(roundsLoaded), // name is generated
            slotsUsed,
            slotsProvided, 
            roundsLoaded,
        );
    }
    
    // @Override
    public getMass():number {
        let ammoMass:number = 0;
        let ammoAvailable:Bag<AmmoType> = this.internalResourceProvider.getAllAvailableResources();
        // Get the distinct ammo types
        for (let ammoType of ammoAvailable.toSet().toArray()) {
            // For each ammo type, sum the mass of that ammo type
            ammoMass += ammoType.mass * ammoAvailable.count(ammoType);
        }

        // Total mass of an ammo box is the mass of the ammobox plus the ammo inside
        return this.data.getMass() + ammoMass;
    }

    private static nameFromRoundsLoaded(roundsLoaded:[[string, number]]):string {
        let ammoClasses:Map<string, AmmoClass> = AmmoClass.getAmmoClassMap();

        let result:string[] = [];
        for (let loading of roundsLoaded) {
            // Looks like "50x 155mm FRP"
            result.push(`${loading[1]}x ${ammoClasses.get(loading[0]).name}`);
        }
        // Looks like "Ammo Storage (50x 155mm FRP, 450x 30mm, 2000x 12.7mm BMG)"
        return `Ammo Storage (${result.join(", ")})`;
    }
}

console.log(JSON.stringify( // new radius = (old radius / (old explosive charge ^ 1/3)) * (new explosive charge ^ 1/3)
    [
        new AmmoTypeSerializable("ammoType_012x099mm_AP", "12.7mm M2 Armour-Piercing (AP)", 0.115, "ammoClass_012x099mm", 1, 900, 2),
        new AmmoTypeSerializable("ammoType_012x099mm_polymer", "12.7mm Mk323 Polymer-Cased Ball", 0.086, "ammoClass_012x099mm", 1, 900, 2),
        new AmmoTypeSerializable("ammoType_030x173mm_HEAB", "Mk310 30mm High Explosive Air-Burst (HEAB-T)", 0.86, "ammoClass_030x173mm", 1, 6, 10), // ~0.04kg warhead
        new AmmoTypeSerializable("ammoType_030x173mm_APFSDS", "Mk258 30mm Armour-Piercing (APFSDS-T)", 0.86, "ammoClass_030x173mm", 1, 9, 1),
        new AmmoTypeSerializable("ammoType_113x1238mm", "4.5-inch High Explosive (HE)", 36.5, "ammoClass_113x1238mm", 1, 200, 97), // ~36.5kg warhead
        new AmmoTypeSerializable("ammoType_155x300mm_railgun_slug", "155mm Ferrous Railgun Projectile", 3.2, "ammoClass_155x300mm_railgun", 1, 900, 2),
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