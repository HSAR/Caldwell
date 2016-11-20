/// <reference path="../../typings/index.d.ts" />
/// <reference path="../../node_modules/excalibur/dist/excalibur.d.ts" />

import fs = require("fs");
import path = require("path");

import glob = require("glob")
import * as ex from "excalibur";
import { Actor, Engine, IEngineOptions, Sprite, Texture, Vector } from "excalibur";
import * as p2 from "p2";
import { Body, Shape } from "p2";

export class Graphics {

    public texturesByPath:Map<string, Texture> = new Map<string, Texture>();

    constructor(materialsFolderPath:string) {
        // Create textures from all .PNG files in the given folder
        let materialsFolderGlob:string = path.join(materialsFolderPath, "**", "*.png");
        let materialPaths:string[] = glob.sync(materialsFolderGlob);

        for (let materialPath of materialPaths) {
            let relPath:string = path.relative(materialsFolderPath, materialPath)
            let texture = new Texture(materialPath);
            this.texturesByPath.set(relPath, texture);
        }
        console.log(`Found ${this.texturesByPath.size} textures to load.`)
    }

    public getTexture(textureRef:string) {
        return this.texturesByPath.get(textureRef);
    }

}