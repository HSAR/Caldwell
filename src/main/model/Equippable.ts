/// <reference path="../../../typings/index.d.ts" />

import { Bag } from 'typescript-collections';

import { Identifiable } from "./General";

export interface HasSlots {
    getSlotsProvided():Bag<string>;
    getEquipped():Bag<(Equippable & UsesSlots)>;
    getSlotsOpen():Bag<string>;
}

export interface UsesSlots {
    getSlotsUsed():Bag<string>;
}

export interface Equippable {
    getId():string;
    getName():string;

    getMass():number;
    getMassTotal():number;

    getEnergyDraw():number;
    getEnergyDrawTotal():number;
}

export class EquippableData extends Identifiable {
    constructor(
        id:string, // must be globally unique
        name:string,

        public mass:number, // kg
        public energyDraw:number, // watts

        public slotsUsed:string[], // list of slots this equipment uses up
        public slotsProvided:string[], // list of slots that other equipment can go into

        public ammoType:string,
        ) {
            super(id, name);
        }
}

export abstract class EquipmentBase implements Equippable, UsesSlots, HasSlots {

    public data:EquippableData;
    equippedTo:Equippable; // "weapon_cannon105 is equipped to weaponMount_twinCannons"
    equipped:Equippable[]; // "weaponMount_twinCannons has [weapon_cannon105, weapon_cannon25] equipped"

    constructor(equippableData:EquippableData) {
        this.data = equippableData;
    }

    getId():string {
        return this.data.id;
    }

    getName():string {
        return this.data.name;
    }

    getMass():number {
        return this.data.mass;
    }

    getMassTotal():number {
        let totalMass:number = this.getMass();
        for (let equipped of this.equipped) {
            totalMass += equipped.getMassTotal();
        }
        return totalMass;
    }

    getEnergyDraw():number {
        return this.data.energyDraw;
    }

    getEnergyDrawTotal():number {
        let totalEnergyDraw:number = this.getEnergyDraw();
        for (let equipped of this.equipped) {
            totalEnergyDraw += equipped.getEnergyDrawTotal();
        }
        return totalEnergyDraw;
    }

    getSlotsUsed():Bag<string> {
        let result = new Bag<string>();
        for (let slot of this.data.slotsUsed) {
            result.add(slot, 1);
        }
        return result;
    }

    getSlotsProvided():Bag<string> {
        let result = new Bag<string>();
        for (let slot of this.data.slotsProvided) {
            result.add(slot, 1);
        }
        return result;
    }

    getEquipped():Bag<(Equippable & UsesSlots)> {
        let equipped:Bag<(Equippable & UsesSlots)> = new Bag<(Equippable & UsesSlots)>();
        for (let equippedItem of this.equipped) {
            equipped.add(equippedItem, 1);
        }
        return equipped;
    }

    getSlotsOpen():Bag<string> {
        let slotsRemaining = this.getSlotsProvided();
        // For each child of this item
        for (let equippedItem of this.getEquipped().toArray()) {
            // Get the slots it uses and remove them from the available slots
            let equippedItemUsedSlots = equippedItem.getSlotsUsed().toArray(); 
            for (let equippedItemUsedSlot of equippedItemUsedSlots) {

                if (!slotsRemaining.remove(equippedItemUsedSlot)) {
                    // Here we are in an error state, we have equipped an item we don't have the slot(s) for
                    // TODO: Handle this error. Throw? <- Stops the user from experimenting with loadouts
                }

            }
        }

        return slotsRemaining;
    }
}