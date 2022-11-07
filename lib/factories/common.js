"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeReactlikeState = exports.keyInObject = void 0;
const __1 = require("..");
function keyInObject(key, object) {
    if (!(key in object)) {
        throw new TypeError(`${key} was not passed in defaults object`);
    }
}
exports.keyInObject = keyInObject;
/**
 * @param defaults The defaults values if they are undefined
 */
function storeReactlikeState(defaults, reactlikeOptions, passedConfiguration, overrideConfiguration = {}) {
    const { current, stateFunctions } = reactlikeOptions.setDefaults(defaults);
    /** State proxy object */
    const state = (0, __1.storeSeparate)(current, Object.assign(Object.assign(Object.assign({}, passedConfiguration), { checkGets: false, checkDefaults: false, 
        // Call useState for relevant key on set
        set(key, value) {
            keyInObject(key, current);
            stateFunctions[key](value);
            current[key] = value;
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
        } }), overrideConfiguration));
    return state;
}
exports.storeReactlikeState = storeReactlikeState;
