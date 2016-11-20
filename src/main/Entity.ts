/// <reference path="../../typings/index.d.ts" />
/// <reference path="../../node_modules/excalibur/dist/excalibur.d.ts" />

import * as ex from "excalibur";
import { Actor, Engine, IEngineOptions, Sprite, Texture, Vector } from "excalibur";
import * as p2 from 'p2';
import { Body, Shape, World } from 'p2';

import { PhysicsWorld } from "./physics";
import { Graphics } from "./graphics";

export enum SupportedShape { Box, Convex, Concave };

export class Entity extends Actor {
    public phys:Body;

    public hasPhysics():boolean {
        return this.body == null;
    }
}

export class EntityBuilder {

    protected result:Entity = (new Actor()) as Entity;
    protected desiredWidth:number = 0; // 0 means "auto"
    protected desiredHeight:number = 0;

    public setPosition(pos:Vector):EntityBuilder {
        this.result.pos.setTo(pos.x, pos.y);
        return this;
    }

    public setAngle(angle:number):EntityBuilder {
        this.result.rotation = angle;
        return this;
    }

    public setVelocity(vel:Vector):EntityBuilder {
        this.result.vel.setTo(vel.x, vel.y);
        return this;
    }

    public setAngularVelocity(angVel:number):EntityBuilder {
        this.result.rx = angVel;
        return this;
    }

    public setSize(width:number, height:number):EntityBuilder {
        this.desiredWidth = width;
        this.desiredHeight = height;
        return this;
    }

    public addSprite(graphics:Graphics, textureRef:string):EntityBuilder {
        if (graphics.getTexture(textureRef) == null) {
            console.log(`Failed to find texture at path ${textureRef}.`)
            return this;
        }

        let sprite:Sprite = graphics.getTexture(textureRef).asSprite();
        this.result.addDrawing(sprite);
        return this;
    }

    public setPhysics(physWorld:PhysicsWorld, shape:SupportedShape, bodyMass:number = 1):EntityBuilder {
        let collisionShape:Shape;
        switch (shape)
        {
            case SupportedShape.Box:
                collisionShape = new p2.Box({ width: this.result.getWidth(), height: this.result.getHeight() });
                break;
            default:
                throw new Error("Unsupported physics shape");
        }

        let collisionBody = new Body({
            mass: bodyMass, // Setting mass to 0 makes it static
        });
        collisionBody.addShape(collisionShape);
        physWorld.world.addBody(collisionBody);

        // When the actor is killed, remove this body from simulation
        this.result.on("kill", (evt:ex.KillEvent) => {
            physWorld.world.removeBody(this.result.phys);
            physWorld.bodiesByActorId.delete(this.result.id);
            this.result.visible = false;
        })

        physWorld.bodiesByActorId.set(this.result.id, collisionBody);
        this.result.phys = collisionBody;
        return this;
    }

    public build():Entity {
        // cutting down on verbosity
        let result = this.result;
        let phys = this.result.phys;

        // Set the size of the actor (magnitude and scale)
        if (result.currentDrawing != null) {
            result.setWidth(result.currentDrawing.width);
            result.setHeight(result.currentDrawing.height);
        }
        let scaleX:number = 1;
        let scaleY:number = 1;
        if (this.desiredWidth > 0) {
            scaleX = this.desiredWidth / this.result.getWidth();
        }
        if (this.desiredHeight > 0) {
            scaleY = this.desiredHeight / this.result.getHeight();
        }
        // if one scale is missing, lock aspect ratio
        if (this.desiredWidth == 0) {
            scaleX = scaleY;
        }
        if (this.desiredHeight == 0) {
            scaleY = scaleX;
        }
        this.result.scale.setTo(scaleX, scaleY);

        // Pass the ex physics attributes to the p2 simulation
        if (result.phys != null) {
            phys.position = [ result.getWorldPos().x, result.getWorldPos().y ];
            phys.angle = result.rotation;
            phys.velocity = [ result.vel.x, result.vel.y ];
            phys.angularVelocity = result.rx;

            // set deltas back to 0, since all movement comes only from sync with p2
            result.vel = Vector.Zero;
            result.rx = 0;
        }

        return result;
    }

}