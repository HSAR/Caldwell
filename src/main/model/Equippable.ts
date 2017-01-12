/// <reference path="../../../typings/index.d.ts" />

import { Bag } from 'typescript-collections';

export interface HasSlots {
    getSlotsProvided():Bag<string>;
    getEquipped():Bag<(Equippable & UsesSlots)>;
    getSlotsOpen():Bag<string>;
}

export interface UsesSlots {
    getSlotsUsed():Bag<string>;
}

export interface HasMass {
    getTotalMass():number;
}

export interface Equippable {

    getId():string;
    getName():string;

    getMass():number;
    getMassTotal():number;

    getEnergyDraw():number;
    getEnergyDrawTotal():number;

}

export abstract class EquipmentBase implements Equippable, UsesSlots, HasSlots {

    id:string; // must be globally unique
    name:string;

    equippedTo:Equippable; // "weapon_cannon105 is equipped to weaponMount_twinCannons"
    slotsUsed:string[]; // list of slots this equipment uses up
    slotsProvided:string[]; // list of slots that other equipment can go into
    equipped:Equippable[]; // "weaponMount_twinCannons has [weapon_cannon105, weapon_cannon25] equipped"

    mass:number; // kg
    energyDraw:number; // j

    getId():string {
        return this.id;
    }

    getName():string {
        return this.name;
    }

    getMass():number {
        return this.mass;
    }

    getMassTotal():number {
        let totalMass:number = this.getMass();
        for (let equipped of this.equipped) {
            totalMass += equipped.getMassTotal();
        }
        return totalMass;
    }

    getEnergyDraw():number {
        return this.energyDraw;
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
        for (let slot of this.slotsUsed) {
            result.add(slot, 1);
        }
        return result;
    }

    getSlotsProvided():Bag<string> {
        let result = new Bag<string>();
        for (let slot of this.slotsProvided) {
            result.add(slot, 1);
        }
        return result;
    }

    getEquipped():Bag<(Equippable & UsesSlots)> {
        let equipped:Bag<(Equippable & UsesSlots)> = new Bag<(Equippable & UsesSlots)>();
        for (let equippedItem of this.equipped) {
            equipped.add(equippedItem, 1);
        }
        return this.equipped;
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