/// <reference path="../../../typings/index.d.ts" />

import { StaticTextCollection } from "../util/StaticTextCollection";

export interface IIdentifiable {
    getId():string; // must be globally unique
    getName():string;
}

export class Identifiable implements IIdentifiable {

    /**
     * All implementing classes should override this property to a class-unique value.
     */
    public static readonly PREFIX = "id";

    constructor(
        private id:string, // must be globally unique
        private name:string,
    ) {
    }

    public getId():string {
        return this.id;
    }

    public getName():string {
        return this.name;
    }

    protected static getClassMappings<T>():[string, T][] {
        return Array.from(StaticTextCollection.getObjectsById())
            .filter((idToObjectMapping:[string, any]) => {
                return idToObjectMapping[0].startsWith(this.PREFIX + "_");
            });
    }

    public static getClassMap<T>():Map<string, T> {
        return new Map<string, T>(Identifiable.getClassMappings<T>());
    };

    public static getClassList<T>():T[] {
        return Identifiable.getClassMappings<T>().map(StaticTextCollection.mappingToValue);
    };

}