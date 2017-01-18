/// <reference path="../../../typings/index.d.ts" />

import { Bag } from 'typescript-collections';
import * as path from "path";

import { Identifiable, IIdentifiable } from "./General";
import { ResourceData, SlotConsumer, SlotProvider } from "./Equippable";

import { StaticTextCollection } from "../util/StaticTextCollection";

export interface IHaveResource<R extends Resource> {

    /**
     * Returns all rounds currently available for immediate feeding.
     */
    getAllAvailableResources():Bag<R>;

    /**
     * Returns the number of rounds of a certain type currently available for immediate feeding.
     */
    getAvailableResource(resourceType:R):number;

    /**
     * Request roundsRequested rounds of type ammoType. Returns the number of rounds actually supplied.
     */
    requestRounds(ammoType:R, roundsRequested:number):number;

}

export interface IUseResource<R extends Resource> {

    /**
     * Gets the resource type currently being drawn.
     */
    getResourceType():R;

    /**
     * Set the component to use this resource type. Returns true if successful.
     */
    setResourceType(resourceType:R):boolean;

    getResourceProviders():IHaveResource<R>[];

    addResourceProvider(resourceProvider:IHaveResource<R>):boolean;

    removeResourceProvider(resourceProvider:IHaveResource<R>):boolean;

    /**
     * Consume quantityRequested of the current resource from the attached providers. Returns the quantity actually served.
     */
    consumeResource(quantityRequested:number):number;
}

export class ResourceProvider<R extends Resource> implements IHaveResource<R> {

    private resourcesLoaded:Bag<R> = new Bag<R>();

    constructor(
        resourcesToLoad:[string, number][] // Multiple types can be supported. [["ammo_012x099mm", 100], ["ammo_030x173mm_shell", 10]] 
    ) {
        let resourceTypes:Map<string, Resource> = Resource.getClassMap();
        for (let resourceType of resourcesToLoad) {
            this.resourcesLoaded.add(<R> resourceTypes.get(resourceType[0]), resourceType[1]);
        }
    }

    getAllAvailableResources():Bag<R> {
        return this.resourcesLoaded;
    }

    getAvailableResource(resourceType:R):number {
        return this.getAllAvailableResources().count(resourceType);
    }

    requestRounds(resourceType:R, roundsRequested:number):number {
        // If 5 rounds and 45 are requested, serve 5
        let roundsServed = Math.min(this.getAllAvailableResources().count(resourceType), roundsRequested);

        this.resourcesLoaded.remove(resourceType, roundsServed);
        return roundsServed;
    }
}

export class ResourceConsumer<R extends Resource> implements IUseResource<R> {
    constructor(
        private resourceProviders:IHaveResource<R>[], // implemented as a list to preserve priority
        private resourceType:R
    ) {
    }

    public getResourceType():R {
        return this.resourceType;
    }

    public setResourceType(ammoType:R):boolean {
        this.resourceType = ammoType;
        return true;
    }

    public getResourceProviders():IHaveResource<R>[] {
        return this.resourceProviders.slice(0);
    }

    public addResourceProvider(resourceProvider:IHaveResource<R>):boolean {
        this.resourceProviders.push(resourceProvider);
        return true;
    }

    public removeResourceProvider(resourceProvider:IHaveResource<R>):boolean {
        let index = this.resourceProviders.indexOf(resourceProvider)
        if (index > -1) {
            this.resourceProviders.splice(index, 1);
            return true;
        }
        return false;
    }

    public consumeResource(roundsRequested:number):number {
        let roundsServed = 0;
        if (this.resourceType != null) {
            for (let resourceProvider of this.resourceProviders) {
                roundsServed += resourceProvider.requestRounds(this.resourceType, roundsRequested - roundsServed);
                if (roundsServed == roundsRequested) {
                    return roundsServed;
                }
            }
        }

        return roundsServed;
    }
    
}

export abstract class Resource extends Identifiable {

    public static readonly PREFIX = "resource_";

    public static getClassMap():Map<string, Resource> {
        return new Map<string, Resource>(<[string, Resource][]> Resource.getClassMappings());
    };
    
}