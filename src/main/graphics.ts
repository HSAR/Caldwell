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

    public createActorWithSprite(textureRef:string):Actor {
        if (!this.texturesByPath.get(textureRef)) {
            console.log(`Failed to find texture at path ${textureRef}.`)
            return null;
        }
        let sprite:Sprite = this.texturesByPath.get(textureRef).asSprite();
        var actor = new Actor(0, 0, sprite.width, sprite.height);
        actor.addDrawing(sprite);
        return actor;
    }

    public syncActorDrawingSize(actor:Actor):void {
        let sprite = actor.currentDrawing;
        if (actor.getWidth() > 0) {
            sprite.scale.x = actor.getWidth() / sprite.naturalWidth;
        }
        if (actor.getHeight() > 0) {
            sprite.scale.y = actor.getHeight() / sprite.naturalHeight;
        }

        // If one scale is missing, lock aspect ratio
        if (sprite.scale.x == 1 && sprite.scale.y !== 1) {
            sprite.scale.x = sprite.scale.y;
        }
        if (sprite.scale.y == 1 && sprite.scale.x !== 1) {
            sprite.scale.y = sprite.scale.x;
        }

        if (actor.getWidth() == 0 && actor.getHeight() == 0) {
            // If nothing set, instead set the actor to match the sprite
            actor.setWidth(sprite.width);
            actor.setHeight(sprite.height);
        }
    }

    public setDimensions(actor:Actor, x:number, y:number):void {
        let scaleX, scaleY:number;
        if (x > 0) {
            scaleX = x / actor.getWidth();
        }
        if (y > 0) {
            scaleY = y / actor.getHeight();
        }

        // If one scale is missing, lock aspect ratio
        if (x == 0) {
            scaleX = scaleY;
        }
        if (y == 0) {
            scaleY = scaleX;
        }

        this.recursiveSetScale(actor, scaleX, scaleY);
    }

    private recursiveSetScale(actor:Actor, scaleX:number, scaleY:number):void {
        actor.scale.setTo(scaleX, scaleY);
        for (let child of actor.children) {
            this.recursiveSetScale(child, scaleX, scaleY);
        };
    }

}