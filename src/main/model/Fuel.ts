/// <reference path="../../../typings/index.d.ts" />

import { Bag } from 'typescript-collections';

import { IIdentifiable } from "./General";
import { ComponentBase, ResourceData } from "./Equippable";
import { IHaveResource, IUseResource, Resource, ResourceProvider, ResourceConsumer, ResourceStorage } from './Resource';

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
 * Fuel resource is consumed by reactors and drives.
 * NB: Fuel mass is assumed to be 1kg per unit.
 */
export class FuelType extends Resource {

    public static readonly PREFIX:string = "fuelType";

    constructor(
        id:string, // must be globally unique
        name:string,
    ) {
        super(id, name);
    }

    public static fromJSON(serialized:FuelSerializable): FuelType {
        return new FuelType(
            serialized.id,
            serialized.name,
        );
    }
}

export class FuelTank extends ResourceStorage<FuelType> implements IHaveResource<FuelType> {

    constructor(
        id:string, // must be globally unique
        name:string,

        slotsUsed:string[], 
        slotsProvided:string[],

        fuelLoaded:[[string, number]] // Multiple types can be supported. [["ammo_012x099mm", 100], ["ammo_030x173mm_shell", 10]] 
    ) {
        super(
            "storage_fuel",  // fuel tanks are currently singletons
            FuelTank.nameFromFuelLoaded(fuelLoaded), // name is generated
            slotsUsed,
            slotsProvided, 
            fuelLoaded,
        );
    }
    
    // @Override
    public getMass():number {
        let fuelMass:number = 0;
        let fuelAvailable:Bag<FuelType> = this.internalResourceProvider.getAllAvailableResources();
        // Get the distinct fuel types
        for (let FuelType of fuelAvailable.toSet().toArray()) {
            // Fuel weighs 1kg per unit
            fuelMass +=  fuelAvailable.count(FuelType);
        }

        // Total mass of an ammo box is the mass of the ammobox plus the ammo inside
        return this.data.getMass() + fuelMass;
    }

    private static nameFromFuelLoaded(roundsLoaded:[[string, number]]):string {
        let fuelTypes:Map<string, FuelType> = FuelType.getClassMap();

        let result:string[] = [];
        for (let loading of roundsLoaded) {
            // Looks like "100kg Hydrocarbon (Fuel Oil)"
            result.push(`${loading[1]}kg ${fuelTypes.get(loading[0]).getName()}`);
        }
        // Looks like "Fuel Storage (100kg Hydrocarbon (Fuel Oil), 50kg Xenon)"
        return `Fuel Storage (${result.join(", ")})`;
    }
}

console.log(JSON.stringify(
    [
        new FuelType("fuelType_hydrogen", "Hydrogen"),
        new FuelType("fuelType_xenon", "Xenon"),
        new FuelType("fuelType_diesel", "Hydrocarbon (Diesel)"),
        new FuelType("fuelType_fuelOil", "Hydrocarbon (Fuel Oil)"),
    ]
));