/// <reference path="../../typings/index.d.ts" />
/// <reference path="../../node_modules/excalibur/dist/excalibur.d.ts" />

import * as ex from "excalibur";
import { Actor, Engine, IEngineOptions, Sprite, Texture, Vector } from "excalibur";
import * as p2 from "p2";
import { Body, Shape } from "p2";

export class PhysicsWorld {

    public world:p2.World;
    public game:ex.Engine;
    public bodiesByActorId:Map<number, Body> = new Map<number, Body>();

    constructor(game: ex.Engine) {
        this.game = game;
        this.world = new p2.World({
            gravity:[0, 10] // minus values cause things to fall upwards
        });

        var fixedTimeStep = 1 / 60; // seconds
        var maxSubSteps = 10; // Max sub steps to catch up with the wall clock

        // Add the ground
        var groundBody = new Body({
            mass: 0, // Setting mass to 0 makes it static
            position: [0, game.canvasHeight],
            angle: Math.PI
        });
        groundBody.addShape(new p2.Plane());
        this.world.addBody(groundBody);

        // Setup simulation
        this.game.on("postupdate", (evt:ex.PostUpdateEvent) => {
            // Step physics simulation
            this.world.step(fixedTimeStep, evt.delta, maxSubSteps);

            // Update actors in world
            for (let actor of this.game.currentScene.children) {
                // p2 position => ex position
                if (this.bodiesByActorId.has(actor.id)) {
                    let actorPhysicsBody:Body = this.bodiesByActorId.get(actor.id);
                    actor.pos.setTo(actorPhysicsBody.interpolatedPosition[0], actorPhysicsBody.interpolatedPosition[1]);
                    actor.rotation = actorPhysicsBody.interpolatedAngle;

                    // Do not use Excalibur delta-pos or delta-rotation
                    actor.vel.setTo(0, 0);
                    actor.rx = 0;
                }
            }
        });
    }

}