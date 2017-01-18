/// <reference path="../../../typings/index.d.ts" />
/// <reference path="../../../node_modules/excalibur/dist/excalibur.d.ts" />

import * as fs from "fs";
import * as path from "path";

import * as glob from "glob";
import * as _ from "lodash";
import * as ex from "excalibur";

import { IIdentifiable } from "../model/General";

export class StaticTextCollection {

    private jsonResources:ex.Resource<Object>[] = new Array<ex.Resource<Object>>();
    private static objectsById:Map<string, any> = new Map<string, any>();

    constructor(jsonFolderPath:string) {
        // Create textures from all .json files in the given folder
        let jsonFolderGlob:string = path.join(jsonFolderPath, "**", "*.json");
        let jsonPaths:string[] = glob.sync(jsonFolderGlob);
        console.log(`Found ${jsonPaths.length} textures to load.`)

        for (let jsonPath of jsonPaths) {
            let relPath:string = path.relative(jsonFolderPath, jsonPath)
            let jsonResource:ex.Resource<Object> = new ex.Resource<Object>(jsonPath, "application/json");

            // Function called when the file is loaded
            jsonResource.processData = (data:any) => {
                // This correctly returns [] if the JSON file is not an array at the top level.
                let identifiables:IIdentifiable[] = _.uniqBy(data, (element:IIdentifiable) => { // Function used by _.uniqBy() to determine what is 'unique'. 
                    // This correctly fails if any object is not an IIdentifiable.
                    return element.getId();
                })

                for (let identifiable of identifiables) {
                    StaticTextCollection.objectsById.set(identifiable.getId(), identifiable);
                }
            }
        }
    }

    public static mappingToValue(idToObjectMapping:[string, any]):any {
        return idToObjectMapping[1];
    }

    public getAllResources():ex.Resource<Object>[] {
        return this.jsonResources;
    }

    public static getObjectById(id:string):Object {
        return StaticTextCollection.objectsById.get(id);
    }

    public static getObjectsById():Map<string, any> {
        return StaticTextCollection.objectsById;
    }

}