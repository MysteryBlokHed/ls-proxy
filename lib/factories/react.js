"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeStateful = void 0;
const __1 = require("..");
function keyInObject(key, object) {
    if (!(key in object)) {
        throw new TypeError(`${key} was not passed in defaults object`);
    }
}
/**
 * Store multiple separate values in state that are automatically updated
 * @param defaults The defaults values if they are undefined
 * @param useState React's `useState` function, passed as-is
 * @param configuration Config options
 * @template O The stored object
 *
 * @example
 * ```tsx
 * import { storeStateful } from 'ls-proxy/factories/react'
 * import { useState } from 'react'
 *
 * const MyComponent = () => {
 *   const state = storeStateful({ count: 0 }, useState)
 *
 *   // When this button is clicked, the count is incremented and state is updated automatically
 *   return <button onClick={() => state.count++}>{state.count}</button>
 * }
 * ```
 */
function storeStateful(defaults, useState, configuration = {}) {
    /** Current values */
    const object = {};
    /** setState functions */
    const stateFunctions = {};
    // Iterate over keys of defaults object
    for (const key of Object.keys(defaults).sort()) {
        // Save current value and setState method in separate objects
        ;
        [object[key], stateFunctions[key]] = useState(defaults[key]);
    }
    /** State proxy object */
    const state = (0, __1.storeSeparate)(object, Object.assign(Object.assign({}, configuration), { checkGets: false, checkDefaults: false, 
        // Call useState for relevant key on set
        set(key, value) {
            keyInObject(key, object);
            stateFunctions[key](value);
            object[key] = value;
        }, 
        // Should never be called due to config
        get: () => null, 
        // Don't parse anything since raw object is stored
        parse: value => value, 
        // Stringify and reparse if it's an object to remove the proxy while storing
        // Fixes React not rerendering on array/object changes
        stringify(value) {
            if (typeof value === 'object')
                return JSON.parse(JSON.stringify(value));
            return value;
        } }));
    return state;
}
exports.storeStateful = storeStateful;
