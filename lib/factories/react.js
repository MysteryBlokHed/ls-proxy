"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeStateful = void 0;
const __1 = require("..");
function keyInObject(key, object) {
    if (!(key in object)) {
        throw new TypeError(`${key} was not passed in defaults object`);
    }
}
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
        // Return current value from original object
        get(key) {
            return object[key];
        }, 
        // Don't parse anything since raw object is stored
        parse: value => value, 
        // Stringify and reparse if it's an object to remove the proxy while storing
        // Fixes React not rerendering on array/object changes
        stringify(value) {
            if (typeof value == 'object')
                return JSON.parse(JSON.stringify(value));
            return value;
        } }));
    return state;
}
exports.storeStateful = storeStateful;
