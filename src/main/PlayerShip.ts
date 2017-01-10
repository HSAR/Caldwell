/// <reference path="../../typings/index.d.ts" />
/// <reference path="../../node_modules/excalibur/dist/excalibur.d.ts" />

import { Entity } from "./Entity";

export class PlayerShip extends Entity {
    
    public recoil(projectileMass:number, projectileVelocity:number[]):Entity {
        var deltaMomentum:number[] = [projectileMass * projectileVelocity[0], projectileMass * projectileVelocity[1]];
        var deltaVelocity = [deltaMomentum[0] / this.phys.mass, deltaMomentum[1] / this.phys.mass];
        this.phys.velocity[0] += deltaVelocity[0];
        this.phys.velocity[1] += deltaVelocity[1];
        return this;
    }

}