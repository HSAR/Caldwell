/// <reference path="../../typings/index.d.ts" />
/// <reference path="../../node_modules/excalibur/dist/excalibur.d.ts" />

import * as ex from "excalibur";
import { Engine, IEngineOptions, Texture } from "excalibur";

var game = new Engine({
    width: 400,
    height: 300
});

// Setup input
// IEngineOptions.pointerScope = ex.Input.PointerScope.Canvas;

// Load textures
var txCursor:Texture = new Texture("./assets/materials/crosshairs.png");
var txGun:Texture = new Texture("./assets/materials/stoner63.png");
var txCasing:Texture = new Texture("./assets/materials/casing.png");
var loader = new ex.Loader([txCursor, txGun, txCasing]);

// Start the engine to begin the game.
game.start(loader).then(() => {
    // Crosshairs
    var cursor = new ex.Actor(game.getWidth() / 2, game.getHeight() / 2, 64, 64);
    var cursorSprite:ex.Sprite = txCursor.asSprite();
    setDimensions(cursorSprite, cursor);
    cursor.addDrawing(cursorSprite);
    game.add(cursor);

    // Gun
    var gun = new ex.Actor(100, game.getHeight() / 2, 0, 0);
    var gunSprite:ex.Sprite = txGun.asSprite();
    setDimensions(gunSprite, gun);
    gun.addDrawing(gunSprite);
    gun.collisionType = ex.CollisionType.Elastic;
    game.add(gun);

    // Casing
    var casingActors:ex.Actor[] = [];
    var casingSprite:ex.Sprite = txCasing.asSprite();

    game.input.pointers.primary.on('move', (evt:ex.Input.PointerEvent) => {
        // Crosshairs on cursor
        cursor.pos.x = evt.x;
        cursor.pos.y = evt.y;

        // Gun points at cursor
        var diffVec:ex.Vector = new ex.Vector(evt.x - gun.x, evt.y - gun.y)
        gun.rotation = diffVec.toAngle();
    });

    var gunFiring:boolean = false;
    game.input.pointers.primary.on('down', (evt:ex.Input.PointerEvent) => {
        gunFiring = true;
    });
    game.input.pointers.primary.on('up', (evt:ex.Input.PointerEvent) => {
        gunFiring = false;
    });

    game.on('postupdate', (evt:ex.PostUpdateEvent) => {
        // If the mouse button is down, fire a casing from the gun
        if (gunFiring /*&& (new Date()).getTime() % 40 == 0*/) {
            let casing = new ex.Actor(gun.x - 15, gun.y - 15, 10, 0);
            casing.rotation = gun.rotation + (Math.PI / 2);
            setDimensions(casingSprite, casing);
            casing.addDrawing(casingSprite);
            casing.collisionType = ex.CollisionType.Elastic;
            casing.vel.setTo(-1, -50);
            casing.rx = -1;

            // Wire up to the update event
            casing.on('update', function () {
                // If the ball collides with the left side
                // of the screen reverse the x velocity
                if (this.pos.x < (this.getWidth() / 2)) {
                    this.vel.x *= -1;
                }

                // If the ball collides with the right side
                // of the screen reverse the x velocity
                if (this.pos.x + (this.getWidth() / 2) > game.getWidth()) {
                    this.vel.x *= -1;
                }

                // If the ball collides with the top
                // of the screen reverse the y velocity
                if (this.pos.y < 0) {
                    this.vel.y *= -1;
                }
            });

            game.add(casing);
            if (casingActors.length > 100) {
                var oldestCasing:ex.Actor = casingActors.shift();
                oldestCasing.kill();
            }

        }
    });
});

function setDimensions(sprite:ex.Sprite, actor:ex.Actor) {
    if (actor.getWidth() > 0) {
        sprite.scale.x = actor.getWidth() / sprite.naturalWidth;
    }
    if (actor.getHeight() > 0) {
        sprite.scale.y = actor.getHeight() / sprite.naturalHeight;
    }

    // If one scale is missing, lock aspect ratio
    if (sprite.scale.x == 0 && sprite.scale.y !== 0) {
        sprite.scale.x = sprite.scale.y;
    }
    if (sprite.scale.y == 0 && sprite.scale.x !== 0) {
        sprite.scale.y = sprite.scale.x;
    }

    if (actor.getWidth() == 0 && actor.getHeight() == 0) {
        // If nothing set, instead set the actor to match the sprite
        actor.setWidth(sprite.swidth);
        actor.setHeight(sprite.sheight);
    }
}