/// <reference path="../../typings/index.d.ts" />

import { Bag } from 'typescript-collections';
import * as ex from "excalibur";

import { Ship, ShipSerialization } from "./model/Ship";
import { Reactor } from "./model/Reactor";
import { Mount } from "./model/Mount";

let playerShip:Ship = Ship.getClassMap<Ship>().get("ship_fastAttack_gepard");

let reactor:Reactor = Reactor.getClassMap<Reactor>().get("reactor_medium_TB91");
playerShip.equipComponent(reactor);