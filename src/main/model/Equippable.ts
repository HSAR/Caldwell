/// <reference path="../../../typings/index.d.ts" />

import { Bag } from 'typescript-collections';

import { Identifiable } from "./General";
import * as utils from "../util/CollectionUtils";

export interface HasSlots {
    getSlotsProvided():Bag<string>;
    getEquipped():Bag<Resourceable>;
    getSlotsOpen():Bag<string>;

    canEquipItem(itemToEquip:Resourceable):boolean;
    equipItem(itemToEquip:Resourceable, forceEquip:boolean):boolean;
    unequipItem(itemToUnequip:Resourceable):boolean;
}

export interface UsesSlots {
    getSlotsUsed():Bag<string>;
    getEquippedTo():HasSlots;

    equipTo(slotProvider:HasSlots):void;
    unequipFrom(slotProvider:HasSlots):boolean;
}

export interface Resourceable extends UsesSlots {
    getMass():number;
    getMassTotal():number;

    getEnergyDraw():number;
    getEnergyDrawTotal():number;
}

export class SlotProvider implements HasSlots {

    private equipped:Bag<Resourceable>; // "weaponMount_twinCannons has [weapon_cannon105, weapon_cannon25] equipped"

    constructor(
        private slotsProvided:string[] // list of slots that other equipment can go into
    ) {
        this.equipped = new Bag<Resourceable>();
    }

    /**
     * All slots provided.
     * @returns A clone Bag of slots.
     */
    public getSlotsProvided():Bag<string> {
        let result = new Bag<string>();
        for (let slot of this.slotsProvided) {
            result.add(slot, 1);
        }
        return result;
    }

    public getEquipped():Bag<Resourceable> {
        return this.equipped;
    }

    public getSlotsOpen():Bag<string> {
        let slotsRemaining = this.getSlotsProvided();
        // For each child of this item
        for (let equippedItem of this.getEquipped().toArray()) {
            // Get the slots it uses and remove them from the available slots
            try {
                utils.bagSubtract(slotsRemaining, equippedItem.getSlotsUsed())
            } catch (error) {
                // Here we are in an error state, we have equipped an item we don't have the slot(s) for
                // TODO: Handle this error. Throw? <- Stops the user from experimenting with invalid loadouts
            }
        }

        return slotsRemaining;
    }

    public canEquipItem(itemToEquip:Resourceable):boolean {
        try {
            utils.bagSubtract(this.getSlotsOpen(), itemToEquip.getSlotsUsed());
        } catch (error) {
            return false;
        }
        return true;
    }

    /**
     * Equip an item into the provided slots.
     * @param forceEquip (optional): Equip even if there are not enough slots to equip this item.
     * @returns {boolean} Was this a valid equip request?
     */
    public equipItem(itemToEquip:Resourceable, forceEquip:boolean=false):boolean {
        if (forceEquip || this.canEquipItem(itemToEquip)) {
            // Two-way linking
            this.equipped.add(itemToEquip);
            itemToEquip.equipTo(this);
            return true;
        }
        return false;
    }

    public unequipItem(itemToUnequip:Resourceable) {
        if (this.equipped.contains(itemToUnequip)) {
            this.equipped.remove(itemToUnequip);
            itemToUnequip.unequipFrom(this);
            return true;
        }
        return false;
    }

}

export class SlotConsumer implements UsesSlots {

    equippedTo:HasSlots; // "weapon_cannon105 is equipped to weaponMount_twinCannons"

    constructor(
        private slotsUsed:string[] // list of slots this equipment uses up
    ) {
    }

    public getSlotsUsed():Bag<string> {
        let result = new Bag<string>();
        for (let slot of this.slotsUsed) {
            result.add(slot, 1);
        }
        return result;
    }

    public getEquippedTo():HasSlots {
        return this.equippedTo;
    }

    public equipTo(slotProvider:HasSlots):void {
        this.equippedTo = slotProvider;
    }

    public unequipFrom(slotProvider:HasSlots):boolean {
        if (slotProvider == this.equippedTo) {
            this.equippedTo = null;
            return true;
        }
        return false;
    }
}

export class ResourceData {
    constructor(
        private mass:number, // kg
        private energyDraw:number // watts
        ) {
    }

    getMass():number {
        return this.mass;
    }

    getEnergyDraw():number {
        return this.energyDraw;
    }
}

/**
 * ItemBase describes any item in the game.
 * Items consume zero or more slots.
 * Items provide zero or more slots.
 * Items have a mass.
 * Items consume zero or more power.
 */
export abstract class ItemBase implements Identifiable, Resourceable, UsesSlots, HasSlots {

    constructor(
        private id:string, // must be globally unique
        private name:string,
        private slotsFilling:SlotConsumer, 
        private slotsProviding:SlotProvider,

        protected data:ResourceData
    ) {
    }

    getId():string {
        return this.id;
    }

    getName():string {
        return this.name;
    }
    
    getMass():number {
        return this.data.getMass();
    }
    
    getMassTotal():number {
        let totalMass:number = this.getMass();
        for (let equipped of this.slotsProviding.getEquipped().toArray()) {
            totalMass += equipped.getMassTotal();
        }
        return totalMass;
    }

    getEnergyDraw():number {
        return this.data.getEnergyDraw();
    }

    getEnergyDrawTotal():number {
        let totalEnergyDraw:number = this.getEnergyDraw();
        for (let equipped of this.slotsProviding.getEquipped().toArray()) {
            totalEnergyDraw += equipped.getEnergyDrawTotal();
        }
        return totalEnergyDraw;
    }

    getSlotsUsed():Bag<string> {
        return this.slotsFilling.getSlotsUsed();
    }

    getEquippedTo():HasSlots {
        return this.slotsFilling.getEquippedTo();
    }

    equipTo(slotProvider:HasSlots):void {
        return this.slotsFilling.equipTo(slotProvider);
    }

    unequipFrom(slotProvider:HasSlots):boolean {
        return this.slotsFilling.unequipFrom(slotProvider);
    }

    getEquipped():Bag<Resourceable> {
        return this.slotsProviding.getEquipped();
    }

    getSlotsOpen():Bag<string> {
        return this.slotsProviding.getSlotsOpen();
    }

    getSlotsProvided():Bag<string> {
        return this.slotsProviding.getSlotsProvided();
    }

    canEquipItem(itemToEquip:Resourceable):boolean {
        return this.slotsProviding.canEquipItem(itemToEquip);
    }

    equipItem(itemToEquip:Resourceable, forceEquip?:boolean):boolean {
        return this.slotsProviding.equipItem(itemToEquip, forceEquip);
    }

    unequipItem(itemToUnequip:Resourceable):boolean {
        return this.slotsProviding.unequipItem(itemToUnequip);
    }
}