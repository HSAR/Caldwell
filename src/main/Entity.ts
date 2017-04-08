/// <reference path="../../typings/index.d.ts" />
/// <reference path="../../node_modules/excalibur/dist/excalibur.d.ts" />

import * as ex from "excalibur";
import { Actor, Engine, IEngineOptions, Polygon, Sprite, Texture, Vector } from "excalibur";
import * as p2 from "p2";
import { Body, Shape, World } from "p2";
var getImageOutline = require("image-outline");
var hull = require("hull.js");

import { PhysicsWorld } from "./physics";
import { StaticBitmapCollection } from "./util/StaticBitmapCollection";

export enum SupportedShape { Box, Convex, Concave };

export class Entity extends Actor {

    public phys:Body;

    public textureRef:string;

    public hasPhysics():boolean {
        return this.phys != null;
    }

    public getTextureRef():string {
        return this.textureRef;
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

    protected result:Entity = new Entity();
    protected desiredWidth:number = 0; // 0 means "auto"
    protected desiredHeight:number = 0;

    protected physWorld:PhysicsWorld = null;
    protected desiredShape:SupportedShape = null;
    protected desiredMass:number = 1;

    protected bitmaps:StaticBitmapCollection = null;

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

    /**
     * Sets the size of the entity, by scaling its X or Y. Leave 0 to auto preserve aspect ratio.
     * WARNING: Do not set both at once. Excalibur will screw up the rotation of the actor.
     */
    public setSize(width:number, height:number):EntityBuilder {
        this.desiredWidth = width;
        this.desiredHeight = height;
        return this;
    }

    public addSprite(bitmaps:StaticBitmapCollection, textureRef:string):EntityBuilder {
        this.bitmaps = bitmaps;
        if (bitmaps.getTexture(textureRef) == null) {
            console.log(`Failed to find texture at path ${textureRef}.`)
            return this;
        }

        let sprite:Sprite = bitmaps.getTexture(textureRef).asSprite().clone();

        this.result.addDrawing(sprite);
        this.result.textureRef = textureRef;
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

    public build():Promise<Entity> {
        // cutting down on verbosity
        let result = this.result;
        let phys = this.result.phys;

        // Set the size of the actor (magnitude and scale)
        this.buildSizeAndScale(result);

        // Build physics objects and add to the simulation
        return this.buildPhysics(result).then(() => {
            return result;
        });
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

    private async buildPhysics(result:Entity):Promise<void> {
        if (this.physWorld == null) {
            return Promise.resolve();
        } else {
            let collisionBody = new Body({
                mass: this.desiredMass, // Setting mass to 0 makes it static		
                position: [ result.getWorldPos().x, result.getWorldPos().y ],		
                angle: result.rotation,		
                velocity: [result.vel.x, result.vel.y],		
                angularVelocity: result.rx
            });

            return this.addCollisionShape(collisionBody, this.desiredShape).then(() => {
                this.physWorld.world.addBody(collisionBody);
                this.physWorld.bodiesByActorId.set(result.id, collisionBody);
                result.phys = collisionBody;

                // set deltas back to 0, since all movement comes only from sync with p2
                result.vel = Vector.Zero;
                result.rx = 0;
            })
        }
    }

    private addCollisionShape(collisionBody:Body, shape:SupportedShape):Promise<void> {
        let result = this.result;
        switch (shape)
        {
            case SupportedShape.Box:
                let collisionShape:Shape;
                collisionShape = new p2.Box({ width: result.getWidth(), height: result.getHeight() });
                collisionBody.addShape(collisionShape);
                return Promise.resolve();
            case SupportedShape.Concave:
                return this.createCollisionFromBitmap(collisionBody, this.bitmaps.getTexture(result.textureRef).path)
                        .then(() => {
                        });
            default:
                return Promise.reject(new Error("Unsupported physics shape"));
        }
    }

    private createCollisionFromBitmap(collisionBody:Body, pathToImage:string):Promise<{}> {
        return new Promise((resolve,reject) => {
            getImageOutline(pathToImage, (err:any, outline:{x:number, y:number}[]) => {
                if (err) {
                    reject(err);
                }
                
                // [{x: 5, y: 7}] => [[5, 7]]
                let points:number[][] = outline.map((element:{x:number, y:number}) => {
                    return [ element.x, element.y ];
                });

                // apply scale
                points = points.map((element:number[]) => {
                    return [element[0] * this.result.scale.x, element[1] * this.result.scale.y];
                });

                // The generated points from hull() don't seem to work with p2.Body.fromPolygon()
                //let collisionPolygon:number[][] = hull(points, 90); // returns points of the hull (in clockwise order)

                // Give a concave path to the body.
                let fromPolyResult = collisionBody.fromPolygon(points, true);
                console.log("Attempt to add custom collision shape: " + fromPolyResult);

                // debug: create a drawable polygon to render the collision shape
                // [[5, 7]] => [{x: 5, y: 7}:Vector]
                // let collisionPolygonVecs:Vector[] = points.map((element:number[]) => {
                //     return new Vector(element[0], element[1]);
                // });
                // let polygon:Polygon = new Polygon(collisionPolygonVecs);
                // polygon.filled = false;
                // polygon.lineColor = ex.Color.Red;
                // this.result.addDrawing("debugPolygon", polygon);
                // this.result.setDrawing("debugPolygon");

                resolve();
            });
        });
    }
}