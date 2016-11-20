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
        return this.phys == null;
    }

    public setPosition(pos:Vector):Entity {
        this.pos.setTo(pos.x, pos.y);
        
        if (this.hasPhysics()) {
            this.phys.position = [ pos.x, pos.y ];
        }
        return this;
    }

    public setAngle(angle:number):Entity {
        this.rotation = angle;
        
        if (this.hasPhysics()) {
            this.phys.angle = angle;
        }
        return this;
    }
}

export class EntityBuilder {

    protected result:Entity = (new Actor()) as Entity;
    protected desiredWidth:number = 0; // 0 means "auto"
    protected desiredHeight:number = 0;

    protected physWorld:PhysicsWorld = null;
    protected desiredShape:SupportedShape = null;
    protected desiredMass:number = 1;

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

    public setPhysics(physWorld:PhysicsWorld, shape:SupportedShape, mass:number = 1):EntityBuilder {
        this.physWorld = physWorld;
        this.desiredShape = shape;
        this.desiredMass = mass;

        // When the actor is killed, remove this body from simulation
        this.result.on("kill", (evt:ex.KillEvent) => {
            physWorld.world.removeBody(this.result.phys);
            physWorld.bodiesByActorId.delete(this.result.id);
            this.result.visible = false;
        })

        return this;
    }

    public build():Entity {
        // cutting down on verbosity
        let result = this.result;
        let phys = this.result.phys;

        // Set the size of the actor (magnitude and scale)
        this.buildSizeAndScale(result);

        // Build physics objects and add to the simulation
        this.buildPhysics(result);

        return result;
    }

    private buildSizeAndScale(result:Entity):void {
        if (result.currentDrawing != null) {
            result.setWidth(result.currentDrawing.width);
            result.setHeight(result.currentDrawing.height);
        }
        let scaleX:number = 1;
        let scaleY:number = 1;
        if (this.desiredWidth > 0) {
            scaleX = this.desiredWidth / result.getWidth();
        }
        if (this.desiredHeight > 0) {
            scaleY = this.desiredHeight / result.getHeight();
        }
        // if one scale is missing, lock aspect ratio
        if (this.desiredWidth == 0) {
            scaleX = scaleY;
        }
        if (this.desiredHeight == 0) {
            scaleY = scaleX;
        }
        result.scale.setTo(scaleX, scaleY);
    }

    private buildPhysics(result:Entity):void {
        if (this.physWorld != null) {
            let collisionShape:Shape;
            switch (this.desiredShape)
            {
                case SupportedShape.Box:
                    collisionShape = new p2.Box({ width: result.getWidth(), height: result.getHeight() });
                    break;
                default:
                    throw new Error("Unsupported physics shape");
            }

            let collisionBody = new Body({
                mass: this.desiredMass, // Setting mass to 0 makes it static		
                position: [ result.getWorldPos().x, result.getWorldPos().y ],		
                angle: result.rotation,		
                velocity: [result.vel.x, result.vel.y],		
                angularVelocity: result.rx
            });
            collisionBody.addShape(collisionShape);

            this.physWorld.world.addBody(collisionBody);
            this.physWorld.bodiesByActorId.set(result.id, collisionBody);
            result.phys = collisionBody;

            // set deltas back to 0, since all movement comes only from sync with p2
            result.vel = Vector.Zero;
            result.rx = 0;
        }
    }

}