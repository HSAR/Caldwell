/// <reference path="../../../typings/index.d.ts" />

export class AmmoType {

    id:string;
    name:string;
    mass:number;
    firingHeat:number;

}

export enum ReloadType {
    Magazine, // Weapon may fire N rounds at maximum fire rate, then stops until entire magazine is replaced.
    Pool, // Weapon may fire N rounds at maximum fire rate, then is limited by loader supply rate. Pool refills if not full, even if weapon is not firing.
    Belt, // Weapon is limited by loader supply rate. N rounds are held "in the belt".
}

export class AmmoSupply {

    id:string;
    name:string;
    mass:number;
    reloadType:ReloadType;
    reloadRate:number // number of rounds/magazines reloaded per second

}