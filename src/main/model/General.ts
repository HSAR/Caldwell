/// <reference path="../../../typings/index.d.ts" />

export interface Identifiable {
    getId():string; // must be globally unique
    getName():string;
}