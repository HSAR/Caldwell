/// <reference path="../../../typings/index.d.ts" />

import { Bag } from 'typescript-collections';
import * as ex from "excalibur";

import { Entity } from "../Entity";
import { IIdentifiable } from "./General";
import { ActivateableComponent, ActivateableResourceData, SlotConsumer, SlotProvider } from "./Equippable";
import { IHasSlots, IUseSlots } from "./Equippable";

export class ShipSerialization {

    constructor(
        public id:string, // must be globally unique
        public name:string,
        public mass:number, // kg
        public passivePowerDraw:number, // watts

        public slotsProvided:string[]
    ) {
    }
}

/**
 * Ships consume no slots.
 */
export class Ship extends ActivateableComponent {

    constructor(
        id:string, // must be globally unique
        name:string,
        mass:number, // kg
        passivePowerDraw:number, // watts

        private slotsProvided:string[] // list of slots that other equipment can go into
        ) {
            super(
                id, 
                name,
                new SlotConsumer([]),
                new SlotProvider(slotsProvided), 
                new ActivateableResourceData(mass, passivePowerDraw, 0)
            );
        }

    public activate() {
        return true;
    }

    public getTickRate() {
        return 0;
    }
}

/**
 * An instance of a ship in-game. Has physics interactions and can be drawn on screen.
 */
export class ShipEntity {
    
    constructor(
        protected ship:Ship,
        protected entity:Entity) {
            entity.on("preupdate", (evt:ex.PreUpdateEvent) => {
                ship.tick(evt.delta);
            })
    }

}

console.log(JSON.stringify(
    [
        new ShipSerialization("ship_destroyer_distantMountain", "Distant Mountain-class destroyer", 120000000, 1000, ["slot_engine_large", "slot_reactor_large", "slot_mount_large", "slot_mount_medium", "slot_mount_medium"]),
        new ShipSerialization("ship_shuttle_lifeboat", "Severn-class shuttle", 30000, 10,  ["slot_engine_small", "slot_reactor_small", "slot_mount_small"]),
        new ShipSerialization("ship_fastAttack_gepard", "Gepard-class fast attack craft", 390000, 20,  ["slot_engine_medium", "slot_reactor_medium", "slot_mount_medium"]),
        new ShipSerialization("ship_corvette_kamorta", "Kamorta-class corvette", 3000000, 100, ["slot_engine_medium", "slot_reactor_medium", "slot_mount_medium", "slot_mount_medium"])
    ]
));