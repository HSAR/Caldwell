/// <reference path="../../../typings/index.d.ts" />
/// <reference path="../../../node_modules/excalibur/dist/excalibur.d.ts" />

import { ComponentBase, IResourceable, ResourceData, SlotConsumer, SlotProvider } from "./Equippable";

export class MountSerialization {
    constructor(
        public id:string, // must be globally unique
        public name:string,
        public mass:number, // kg
        public passivePowerDraw:number, // watts

        public slotsUsed:string[], 
        public slotsProvided:string[],

        public elevationMax:number, // degrees up
        public elevationMin:number, // degrees down
        public elevationPower:number, // degrees per kilo per second
    ) {
    }
}

export class Mount extends ComponentBase {
    private slotToFiringArc:Map<string, [number, number]> = new Map<string, [number, number]>();

    constructor(
        id:string, // must be globally unique
        name:string,
        mass:number, // kg
        passivePowerDraw:number, // watts

        private slotsUsed:string[], 
        private slotsProvided:string[],

        public elevationMax:number, // degrees up
        public elevationMin:number, // degrees down
        public elevationPower:number, // degrees per kilo per second
    ) {
        super(
            id, 
            name,
            new SlotConsumer(slotsUsed),
            new SlotProvider(slotsProvided), 
            new ResourceData(mass, passivePowerDraw)
        );
    }

    static fromJSON(serialized:MountSerialization): Mount {
        return new Mount(
            serialized.id,
            serialized.name,
            serialized.mass,
            serialized.passivePowerDraw,
            serialized.slotsUsed,
            serialized.slotsProvided,
            serialized.elevationMax,
            serialized.elevationMin,
            serialized.elevationPower
        );
    }
}

console.log(JSON.stringify(
    [
        new Mount("mount_small_machinegun", "M153 CROWS II", 172, 250, ["slot_mount_small"], ["slot_weapon_machinegun"], 60, -20, 4500),
        new Mount("mount_medium_machinegunQuad", "M45 Small Arms Quad-Mount", 500, 600, ["slot_mount_medium"], ["slot_weapon_machinegun", "slot_weapon_machinegun", "slot_weapon_machinegun", "slot_weapon_machinegun"], 50, -15, 9000),
        new Mount("mount_medium_autocannon_ds30m", "DS30M Mk2 Naval Cannon Mount", 1000, 2000, ["slot_mount_medium"], ["slot_weapon_light_cannon"], 65, -20, 8600),
        new Mount("mount_medium_cannon_Mk8", "Mk8 4.5-inch Naval Gun Mount", 23000, 66160, ["slot_mount_medium"], ["slot_weapon_medium_cannon"], 55, -10, 960000),
        new Mount("mount_large_cannon_Mk21", "Mk21 Naval Mount (Open)", 14000, 30000, ["slot_mount_large"], ["slot_weapon_medium_cannon"], 85, -15, 560000),
        new Mount("mount_large_cannon_Mk30Mod0", "Mk30 Mod 0 Naval Mount", 18600, 30000, ["slot_mount_large"], ["slot_weapon_medium_cannon"], 85, -15, 400000),
        new Mount("mount_large_cannon_Mk29Mod0", "Mk29 Mod 0 Naval Mount (Twin)", 49000, 150000, ["slot_mount_large"], ["slot_weapon_medium_cannon", "slot_weapon_medium_cannon"], 85, -15, 980000),
        new Mount("mount_large_cannon_Mk71", "Mk71 Naval Heavy Mount", 160000, 60000, ["slot_mount_large"], ["slot_weapon_heavy_cannon"], 65, -5, 3200000),
    ]
));