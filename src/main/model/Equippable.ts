/// <reference path="../../../typings/index.d.ts" />

import { Bag } from 'typescript-collections';

import { IIdentifiable } from "./General";
import * as utils from "../util/CollectionUtils";

export interface IHasSlots {
    getSlotsProvided():Bag<string>;
    getEquipped():Bag<(IUseSlots & IResourceable)>;
    getSlotsOpen():Bag<string>;

    canEquipItem(itemToEquip:(IUseSlots & IResourceable)):boolean;
    equipItem(itemToEquip:(IUseSlots & IResourceable), forceEquip:boolean):boolean;
    unequipItem(itemToUnequip:(IUseSlots & IResourceable)):boolean;
}

export interface IUseSlots {
    getSlotsUsed():Bag<string>;
    getEquippedTo():IHasSlots;

    equipTo(slotProvider:IHasSlots):void;
    unequipFrom(slotProvider:IHasSlots):boolean;
}

export interface Activateable { //TODO: Review this - merge with Resourceable?
    timeSinceLastUpdate:number;

    isActive():boolean;
    setActive():boolean;
    setInactive():boolean;

    getActivePowerDraw():number;
    getPowerDraw():number;

    /**
     * Gets the number of times a second this activates. Set to 0 for "activate every update" (expensive!).
     */
    getTickRate():number;

    /**
     * This method is called getTickRate() times a second.
     * Implement the activatable behaviour in here.
     */
    activate():void;

    /**
     * Controls when activate() is called.
     */
    tick(timeSinceLastTick:number):void;
}

export interface IResourceable {

    /**
     * Gets the mass of this component.
     */
    getMass():number;

    /**
     * Gets the mass of this component and all subcomponents
     */
    getMassTotal():number;

    /**
     * Gets the passive power draw of this component.
     */
    getPassivePowerDraw():number;

    /**
     * Gets the current power draw of this component only.
     */
    getPowerDraw():number;

    /**
     * Gets the current power draw of this component and all subcomponents.
     */
    getPowerDrawTotal():number;
}

export class SlotProvider implements IHasSlots {

    // "weaponMount_twinCannons has [weapon_cannon105, weapon_cannon25] equipped"
    private equipped:Bag<(IUseSlots & IResourceable)> = new Bag<(IUseSlots & IResourceable)>();

    constructor(
        private slotsProvided:string[] // list of slots that other equipment can go into
    ) {
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

    public getEquipped():Bag<(IUseSlots & IResourceable)> {
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

    public canEquipItem(itemToEquip:(IUseSlots & IResourceable)):boolean {
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
    public equipItem(itemToEquip:(IUseSlots & IResourceable), forceEquip:boolean=false):boolean {
        if (forceEquip || this.canEquipItem(itemToEquip)) {
            // Two-way linking
            this.equipped.add(itemToEquip);
            itemToEquip.equipTo(this);
            return true;
        }
        return false;
    }

    public unequipItem(itemToUnequip:(IUseSlots & IResourceable)) {
        if (this.equipped.contains(itemToUnequip)) {
            this.equipped.remove(itemToUnequip);
            itemToUnequip.unequipFrom(this);
            return true;
        }
        return false;
    }

}

export class SlotConsumer implements IUseSlots {

    equippedTo:IHasSlots; // "weapon_cannon105 is equipped to weaponMount_twinCannons"

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

    public getEquippedTo():IHasSlots {
        return this.equippedTo;
    }

    public equipTo(slotProvider:IHasSlots):void {
        this.equippedTo = slotProvider;
    }

    public unequipFrom(slotProvider:IHasSlots):boolean {
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
        private passivePowerDraw:number // watts
        ) {
    }

    getMass():number {
        return this.mass;
    }

    getPassivePowerDraw():number {
        return this.passivePowerDraw;
    }
}

export class ActivateableResourceData extends ResourceData {
    constructor(
        mass:number, // kg
        passivePowerDraw:number, // watts
        private activePowerDraw:number // watts
    ) {
        super(mass, passivePowerDraw);
    }

    public getActivePowerDraw():number {
        return this.activePowerDraw;
    }
}

/**
 * ComponentBase describes any component in the game.
 * Components consume zero or more slots.
 * Components provide zero or more slots.
 * Components have a mass.
 * Components consume zero or more power.
 */
export abstract class ComponentBase implements IIdentifiable, IResourceable, IUseSlots, IHasSlots {

    constructor(
        private id:string, // must be globally unique
        private name:string,
        private slotsFilling:IUseSlots, 
        private slotsProviding:IHasSlots,

        protected data:ResourceData
    ) {
    }

    public getId():string {
        return this.id;
    }

    public getName():string {
        return this.name;
    }
    
    public getMass():number {
        return this.data.getMass();
    }
    
    public getMassTotal():number {
        let totalMass:number = this.getMass();
        for (let equipped of this.slotsProviding.getEquipped().toArray()) {
            totalMass += equipped.getMassTotal();
        }
        return totalMass;
    }

    public getPassivePowerDraw():number {
        return this.data.getPassivePowerDraw();
    }

    public getPowerDraw():number {
        return this.getPassivePowerDraw();
    }

    public getPowerDrawTotal():number {
        let totalPowerDraw:number = this.getPowerDraw();
        for (let equipped of this.slotsProviding.getEquipped().toArray()) {
            totalPowerDraw += (<IResourceable> equipped).getPowerDrawTotal();
        }
        return totalPowerDraw;
    }

    public getSlotsUsed():Bag<string> {
        return this.slotsFilling.getSlotsUsed();
    }

    public getEquippedTo():IHasSlots {
        return this.slotsFilling.getEquippedTo();
    }

    public equipTo(slotProvider:IHasSlots):void {
        return this.slotsFilling.equipTo(slotProvider);
    }

    public unequipFrom(slotProvider:IHasSlots):boolean {
        return this.slotsFilling.unequipFrom(slotProvider);
    }

    public getEquipped():Bag<(IUseSlots & IResourceable)> {
        return this.slotsProviding.getEquipped();
    }

    public getSlotsOpen():Bag<string> {
        return this.slotsProviding.getSlotsOpen();
    }

    public getSlotsProvided():Bag<string> {
        return this.slotsProviding.getSlotsProvided();
    }

    public canEquipItem(itemToEquip:(IUseSlots & IResourceable)):boolean {
        return this.slotsProviding.canEquipItem(itemToEquip);
    }

    public equipItem(itemToEquip:(IUseSlots & IResourceable), forceEquip?:boolean):boolean {
        return this.slotsProviding.equipItem(itemToEquip, forceEquip);
    }

    public unequipItem(itemToUnequip:(IUseSlots & IResourceable)):boolean {
        return this.slotsProviding.unequipItem(itemToUnequip);
    }
}

export abstract class ActivateableComponent extends ComponentBase implements Activateable {

    protected isActivated:boolean = false;
    public timeSinceLastUpdate:number = 0;

    constructor(
        id:string, // must be globally unique
        name:string,
        slotsFilling:SlotConsumer, 
        slotsProviding:SlotProvider,
        data:ActivateableResourceData,
    ) {
        super(id, name, slotsFilling, slotsProviding, data);
    }

    public isActive():boolean {
        return this.isActivated;
    }

    public setActive():boolean {
        if (!this.isActivated) {
            this.isActivated = true;
            return true;
        }
        return false;
    }

    public setInactive():boolean {
        if (this.isActivated) {
            this.isActivated = false;
            return true;
        }
        return false;
    }

    public getActivePowerDraw() {
        return (this.data as ActivateableResourceData).getActivePowerDraw();
    }

    // @Override
    public getPowerDraw() {
        let result = this.getPassivePowerDraw()
        if (this.isActive()) {
            result += this.getActivePowerDraw();
        }

        return result;
    }

    public abstract getTickRate():number;

    public abstract activate();

    public tick(timeSinceLastTick:number):void {
        // Tick all children
        for (let equipped of this.getEquipped().toArray()) {
            // #TODO: Find a better way to do this: "if equipped is IActivateable then equipped.activate()"
            if (equipped["tick"]) {
                equipped["tick"]();
            }
        }

        // If tickRate is 0 activate immediately.
        let tickRate = this.getTickRate();
        if (tickRate == 0) {
            return this.activate();
        }

        this.timeSinceLastUpdate += timeSinceLastTick;

        let willActivate = false;
        while (this.timeSinceLastUpdate > tickRate) {
            this.timeSinceLastUpdate -= this.getTickRate();
            this.activate();
        }
    }
}