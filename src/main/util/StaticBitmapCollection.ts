/// <reference path="../../../typings/index.d.ts" />
/// <reference path="../../../node_modules/excalibur/dist/excalibur.d.ts" />

import * as fs from "fs";
import * as path from "path";

import * as glob from "glob";
import * as ex from "excalibur";
import { Actor, Engine, IEngineOptions, Sprite, Texture, Vector } from "excalibur";
import * as p2 from "p2";
import { Body, Shape } from "p2";

export class StaticBitmapCollection {

    private texturesByPath:Map<string, Texture> = new Map<string, Texture>();

    constructor(materialsFolderPath:string) {
        // Create textures from all .PNG files in the given folder
        let materialsFolderGlob:string = path.join(materialsFolderPath, "**", "*.png");
        let materialPaths:string[] = glob.sync(materialsFolderGlob);
        console.log(`Found ${materialPaths.length} textures to load.`)

        for (let materialPath of materialPaths) {
            let relPath:string = path.relative(materialsFolderPath, materialPath)
            let texture = new Texture(materialPath);
            this.texturesByPath.set(relPath, texture);
        }
    }

    public getTexture(textureRef:string):Texture {
        return this.texturesByPath.get(textureRef);
    }

    public getAllTextures():Texture[] {
        return Array.from(this.texturesByPath.values());
    }

}