/// <reference path="../../typings/index.d.ts" />
/// <reference path="../../node_modules/excalibur/dist/excalibur.d.ts" />

import * as path from "path";

import * as ex from "excalibur";
import { Actor, Engine, IEngineOptions, Sprite, Texture, Vector } from "excalibur";
import * as p2 from "p2";
import { Body, Shape } from "p2";

import { PhysicsWorld } from "./physics";
import { StaticBitmapCollection } from "./util/StaticBitmapCollection";
import { StaticTextCollection } from "./util/StaticTextCollection";
import { Entity, EntityBuilder, SupportedShape } from "./Entity";

var game:Engine = new Engine({
    width: 640,
    height: 480
});

// Setup input
// IEngineOptions.pointerScope = ex.Input.PointerScope.Canvas;

// Load textures
let bitmaps = new StaticBitmapCollection(path.join(__dirname, "assets", "materials"));
let jsonFiles = new StaticTextCollection(path.join(__dirname, "assets", "data"));
var loader = new ex.Loader(
    new Array<ex.ILoadable>().concat(
        bitmaps.getAllTextures(),
        jsonFiles.getAllResources(),
    )
);

// Setup physics world
var physics = new PhysicsWorld(game);
var world:p2.World = physics.world;

// Start the engine to begin the game.
game.start(loader).then(() => {
    // Crosshairs
    var cursor:Entity;
    new EntityBuilder()
        .addSprite(bitmaps, "crosshairs.png")
        .setSize(64, 0)
        .build().then((entity:Entity) => {
            cursor = entity;
            game.add(cursor);
        });

    // Gun
    var gun:Entity;
    new EntityBuilder()
        .addSprite(bitmaps, "crosshairs.png")
        .setSize(200, 200)
        .setPosition(new Vector(game.getWidth() / 2, game.getHeight() / 2))
        .setPhysics(physics, SupportedShape.Concave, 0)
        .build().then((entity:Entity) => {
            entity.currentDrawing.scale.setTo(.8, .1);
            
            gun = entity;
            game.add(gun);
        });

    // Casing
    var casingActors:Actor[] = [];

    game.input.pointers.primary.on("move", (evt:ex.Input.PointerEvent) => {
        // Crosshairs on cursor
        cursor.pos.setTo(evt.x, evt.y);

        // Gun points at cursor
        var diffVec:Vector = new Vector(evt.x - gun.phys.position[0], evt.y - gun.phys.position[1]);
        gun.setAngle(diffVec.toAngle());
    });

    game.input.pointers.primary.on("down", (evt:ex.Input.PointerEvent) => {
        let ejectVector:Vector = Vector.Up
            .scale(40)
            .rotate(gun.phys.angle);

        let casing:Entity;
        new EntityBuilder()
            .addSprite(bitmaps, "casing.png")
            .setSize(10, 0)
            .setPosition(gun.pos.add(ejectVector))
            .setAngle(gun.rotation)
            .setVelocity(ejectVector)
            // TODO: Fix this causing odd behaviour due to one physics body spawning inside another
            .setPhysics(physics, SupportedShape.Box, 0.1)
            .build().then((entity:Entity) => {
                casing = entity;
                game.add(casing);

                casingActors.push(casing);
                if (casingActors.length > 10) {
                    casingActors.shift().kill(); // dequeue and kill the oldest casing
                }
            });
    });
});
