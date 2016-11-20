/// <reference path="../../typings/index.d.ts" />
/// <reference path="../../node_modules/excalibur/dist/excalibur.d.ts" />

import path = require("path");

import * as ex from "excalibur";
import { Actor, Engine, IEngineOptions, Sprite, Texture, Vector } from "excalibur";
import * as p2 from "p2";
import { Body, Shape } from "p2";

import { PhysicsWorld } from "./physics";
import { Graphics } from "./graphics";
import { Entity, EntityBuilder, SupportedShape } from "./Entity";

var game:Engine = new Engine({
    width: 640,
    height: 480
});

// Setup input
// IEngineOptions.pointerScope = ex.Input.PointerScope.Canvas;

// Load textures
let graphics = new Graphics(path.join(__dirname, "assets", "materials"));
var loader = new ex.Loader(Array.from(graphics.texturesByPath.values()));

// Setup physics world
var physics = new PhysicsWorld(game);
var world:p2.World = physics.world;

// Start the engine to begin the game.
game.start(loader).then(() => {
    // Crosshairs
    var cursor:Entity = new EntityBuilder()
        .addSprite(graphics, "crosshairs.png")
        .setSize(64, 0)
        .build();
    game.add(cursor);

    // Gun
    var gun:Entity = new EntityBuilder()
        .addSprite(graphics, "stoner63.png")
        .setSize(180, 0)
        .setPosition(new Vector(game.getWidth() / 4, game.getHeight() / 2))
        .setPhysics(physics, SupportedShape.Box, 0)
        .build();
    game.add(gun);

    // Casing
    var casingActors:Actor[] = [];

    game.input.pointers.primary.on("move", (evt:ex.Input.PointerEvent) => {
        // Crosshairs on cursor
        cursor.pos.setTo(evt.x, evt.y);

        // Gun points at cursor
        var diffVec:Vector = new Vector(evt.x - gun.phys.position[0], evt.y - gun.phys.position[1]);
        gun.phys.angle = diffVec.toAngle();
    });

    game.input.pointers.primary.on("up", (evt:ex.Input.PointerEvent) => {
        let ejectVector:Vector = Vector.Up
            .scale(20)
            .rotate(gun.phys.angle);

        let casing = new EntityBuilder()
            .addSprite(graphics, "casing.png")
            .setSize(10, 0)
            .setPosition(gun.pos.add(ejectVector))
            .setAngle(gun.rotation)
            .setVelocity(ejectVector)
            // TODO: Fix this causing odd behaviour due to one physics body spawning inside another
            .setPhysics(physics, SupportedShape.Box, 0.1)
            .build();
        game.add(casing);

        casingActors.push(casing);
        if (casingActors.length > 10) {
            casingActors.shift().kill(); // dequeue and kill the oldest casing
        }
    });
});
