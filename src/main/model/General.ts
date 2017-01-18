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

    protected static getClassMappings():[string, IIdentifiable][] {
        return Array.from(StaticTextCollection.getObjectsById())
            .filter((idToObjectMapping:[string, IIdentifiable]) => {
                return idToObjectMapping[0].startsWith(this.PREFIX + "_");
            });
    }

    public static getClassMap():Map<string, IIdentifiable> {
        return new Map<string, IIdentifiable>(Identifiable.getClassMappings());
    };

    public static getClassList():IIdentifiable[] {
        return Identifiable.getClassMappings().map(StaticTextCollection.mappingToValue);
    };

}