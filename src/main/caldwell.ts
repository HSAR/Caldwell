/// <reference path="../../typings/index.d.ts" />
/// <reference path="../../node_modules/excalibur/dist/excalibur.d.ts" />

import path = require("path");

import * as ex from "excalibur";
import { Actor, Engine, IEngineOptions, Sprite, Texture, Vector } from "excalibur";
import * as p2 from "p2";
import { Body, Shape } from "p2";

import { ActorPhysics, PhysicsWorld, SupportedShape} from "./physics";
import { Graphics } from "./graphics";

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
    var cursor = graphics.createActorWithSprite("crosshairs.png");
    graphics.setDimensions(cursor, 64, 0);
    graphics.syncActorDrawingSize(cursor);
    game.add(cursor);

    // Gun
    var gunPhys:ActorPhysics = physics.addToPhysicsWorld(graphics.createActorWithSprite("stoner63.png"), SupportedShape.Box, 0);
    graphics.setDimensions(gunPhys.actor, 180, 0);
    graphics.syncActorDrawingSize(gunPhys.actor);
    gunPhys.body.position = [game.getWidth() / 4, game.getHeight() / 2];
    game.add(gunPhys.actor);

    // Casing
    var casingActors:Actor[] = [];

    game.input.pointers.primary.on("move", (evt:ex.Input.PointerEvent) => {
        // Crosshairs on cursor
        cursor.pos.setTo(evt.x, evt.y);

        // Gun points at cursor
        var diffVec:Vector = new Vector(evt.x - gunPhys.body.position[0], evt.y - gunPhys.body.position[1]);
        gunPhys.body.angle = diffVec.toAngle();
    });

    game.input.pointers.primary.on("up", (evt:ex.Input.PointerEvent) => {
        let casingPhys:ActorPhysics = physics.addToPhysicsWorld(graphics.createActorWithSprite("casing.png"), SupportedShape.Box, 0.1);;
        graphics.setDimensions(casingPhys.actor, 10, 0);
        graphics.syncActorDrawingSize(casingPhys.actor);

        let velocity:Vector = Vector.Up;
        velocity = velocity.rotate(gunPhys.body.angle);
        // TODO: Fix this causing odd behaviour due to one physics body spawning inside another
        casingPhys.body.position = gunPhys.body.position;
        casingPhys.body.velocity = [velocity.x, velocity.y];
        casingPhys.body.angle = gunPhys.body.angle;

        game.add(casingPhys.actor);
        casingActors.push(casingPhys.actor);
        if (casingActors.length > 10) {
            var oldestCasing:Actor = casingActors.shift();
            oldestCasing.kill();
        }
    });
});
