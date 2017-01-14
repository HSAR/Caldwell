/// <reference path="../../../typings/index.d.ts" />

export interface IIdentifiable {
    getId():string; // must be globally unique
    getName():string;
}