/// <reference path="../../../typings/index.d.ts" />

import { Bag } from 'typescript-collections';

export function bagClone<T>(a:Bag<T>):Bag<T> {
    let result = new Bag<T>();
    for (let elementInA of a.toArray()) {
        result.add(elementInA);
    }
    return result;
}

export function bagSubtract<T>(a:Bag<T>, b:Bag<T>):Bag<T> {
    // Clone a
    let result = bagClone(a);
    // For each element in b
    for (let elementInB of b.toArray()) {
        // Remove it from a
            if (!result.remove(elementInB)) {
                throw new Error("Bag subtraction error: first argument is not a superset of the second.")
            }
    }

    return result;
}