/// <reference path="../../typings/index.d.ts" />

import * as _ from "lodash";

var namor = require('namor');

export function generateShipName():string {
    // Raw name array, looks like: ["hypnotic", "sock"]
    let rawNameArray:string[] = namor.generate({ words: 2, numLen: 0,  manly: true}).split('-');
    // Capitalise using Array.map and lodash.capitalize
    let capitalisedNameArray:string[] = rawNameArray.map((element) => { return _.capitalize(element)});
    // Join the array together to return the final name
    return capitalisedNameArray.join(' ');
}