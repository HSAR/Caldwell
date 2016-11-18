/// <reference path="../../typings/index.d.ts" />
/// <reference path="../../node_modules/excalibur/dist/excalibur.d.ts" />

import * as ex from "excalibur";
import { Engine, IEngineOptions, Texture } from "excalibur";
import * as p2 from 'p2';

var game = new Engine({
    width: 640,
    height: 480
});

// Setup input
// IEngineOptions.pointerScope = ex.Input.PointerScope.Canvas;

// Load textures
var txCursor:Texture = new Texture("./assets/materials/crosshairs.png");
var txGun:Texture = new Texture("./assets/materials/stoner63.png");
var txCasing:Texture = new Texture("./assets/materials/casing.png");
var loader = new ex.Loader([txCursor, txGun, txCasing]);

// Setup physics world
var world = new p2.World({
    gravity:[0, 10] // minus values cause things to fall upwards
});
var fixedTimeStep = 1 / 60; // seconds
var maxSubSteps = 10; // Max sub steps to catch up with the wall clock
var bodies_simulated:Map<number, p2.Body> = new Map<number, p2.Body>();

var groundBody = new p2.Body({
    mass: 0, // Setting mass to 0 makes it static
    position: [0, game.getHeight()],
    angle: Math.PI
});
var groundShape = new p2.Plane();
groundBody.addShape(groundShape);
world.addBody(groundBody);

// Start the engine to begin the game.
game.start(loader).then(() => {
    // Crosshairs
    var cursorSprite:ex.Sprite = txCursor.asSprite();
    var cursor = new ex.Actor(game.getWidth() / 2, game.getHeight() / 2, cursorSprite.width, cursorSprite.height);
    setDimensions(cursor, 64, 0);
    matchDimensions(cursorSprite, cursor);
    cursor.addDrawing(cursorSprite);
    game.add(cursor);

    // Gun
    var gunSprite:ex.Sprite = txGun.asSprite();
    var gun = new ex.Actor(100, game.getHeight() / 2, gunSprite.width, gunSprite.height);
    var gunPort = new ex.Actor(-16, -14, 1, 1);
    gun.add(gunPort);
    setDimensions(gun, 180, 0);
    matchDimensions(gunSprite, gun);
    gun.addDrawing(gunSprite);
    setPhysics(gun, SupportedShape.Box, 0);
    game.add(gun);
    
    let gunShape:p2.Shape;
    gunShape = new p2.Box({ width: gun.getWidth(), height: gun.getHeight() });
    let gunBody = createBodyFromActor(gun, 0);
    gunBody.addShape(gunShape);
    world.addBody(gunBody);

    // Casing
    var casingActors:ex.Actor[] = [];
    var casingSprite:ex.Sprite = txCasing.asSprite();

    game.input.pointers.primary.on('move', (evt:ex.Input.PointerEvent) => {
        // Crosshairs on cursor
        cursor.pos.x = evt.x;
        cursor.pos.y = evt.y;

        // Gun points at cursor
        var diffVec:ex.Vector = new ex.Vector(evt.x - gun.x, evt.y - gun.y)
        bodies_simulated.get(gun.id).angle = diffVec.toAngle();
    });

    game.input.pointers.primary.on('up', (evt:ex.Input.PointerEvent) => {
        let casing = new ex.Actor(gunPort.getWorldPos().x - 15, gunPort.getWorldPos().y - 15, casingSprite.width, casingSprite.height);
        setDimensions(casing, 10, 0);
        matchDimensions(casingSprite, casing);
        casing.addDrawing(casingSprite);

        // Set motion that will be picked up by p2
        let velocity:ex.Vector = new ex.Vector(-1, -50);
        velocity = velocity.rotate(gunPort.getWorldRotation(), ex.Vector.Zero);
        casing.vel.setTo(velocity.x, velocity.y);
        casing.rotation = gunPort.getWorldRotation();
        //casing.rx = -0.5;
        

        setPhysics(casing, SupportedShape.Box, 0.1);

        game.add(casing);
        casingActors.push(casing);
        if (casingActors.length > 10) {
            var oldestCasing:ex.Actor = casingActors.shift();
            oldestCasing.kill();
        }
    });

    game.on('postupdate', (evt:ex.PostUpdateEvent) => {
        // Step physics simulation
        world.step(fixedTimeStep, evt.delta, maxSubSteps);

        // Update actors in world
        for (let actor of game.currentScene.children) {
            // If actor is simulated, p2 position => ex position
            if (bodies_simulated.has(actor.id)) {
                let actorPhysicsBody:p2.Body = bodies_simulated.get(actor.id)
                // Excalibur has reversed Y axis
                actor.pos.setTo(actorPhysicsBody.interpolatedPosition[0], actorPhysicsBody.interpolatedPosition[1]);
                actor.rotation = actorPhysicsBody.interpolatedAngle;

                // Do not use Excalibur delta-pos or delta-rotation
                actor.vel.setTo(0, 0);
                actor.rx = 0;
            }
        }
    });
});

function matchDimensions(sprite:ex.Sprite, actor:ex.Actor):void {
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
        actor.setWidth(sprite.swidth);
        actor.setHeight(sprite.sheight);
    }
}

function setDimensions(actor:ex.Actor, x:number, y:number):void {
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

    recursiveSetScale(actor, scaleX, scaleY);
}

function recursiveSetScale(actor:ex.Actor, scaleX:number, scaleY:number):void {
    actor.scale.setTo(scaleX, scaleY);
    for (let child of actor.children) {
        recursiveSetScale(child, scaleX, scaleY);
    };
}

function createBodyFromActor(actor:ex.Actor, mass:number = 1) {
    return new p2.Body({
        mass: mass, // Setting mass to 0 makes it static
        position: [actor.x, actor.y],
        angle: actor.rotation,
        velocity: [actor.vel.x, actor.vel.y],
        angularVelocity: actor.rx
    });
}

enum SupportedShape { Box, Convex, Concave };

function setPhysics(actor:ex.Actor, shape:SupportedShape, mass:number = 1):void {
    let collisionShape:p2.Shape;
    switch (shape)
    {
        case SupportedShape.Box:
            collisionShape = new p2.Box({ width: actor.getWidth(), height: actor.getHeight() });
            break;
        default:
            throw new Error('Unsupported physics shape');
    }

    let collisionBody = createBodyFromActor(actor, mass);
    collisionBody.addShape(collisionShape);
    world.addBody(collisionBody);
    bodies_simulated.set(actor.id, collisionBody);

    // When the actor is killed, remove this body from simulation
    actor.on('kill', (evt:ex.KillEvent) => {
        world.removeBody(bodies_simulated.get(actor.id));
        bodies_simulated.delete(actor.id);
        actor.visible = false;
    })
}