/// <reference path="../../../typings/index.d.ts" />

export class Identifiable {
    constructor(
        public id:string, // must be globally unique
        public name:string,
    ) {
    }
}