// ==UserScript==
// @name        ls-proxy
// @descripton  Wrapper around localStorage to easily store JSON objects
// @version     0.1.0
// @author      Adam Thompson-Sharpe
// @license     MIT
// @homepageURL https://gitlab.com/MysteryBlokHed/ls-proxy
// ==/UserScript==

/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it uses a non-standard name for the exports (exports).
(() => {
var exports = __webpack_exports__;
/*!**********************!*\
  !*** ./lib/index.js ***!
  \**********************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.storeSeparate = exports.storeObject = exports.keyValidation = void 0;
/**
 * A function that can be used to validate that only expected keys are present on an object.
 * Meant to be used in a validate function for `storeObject`
 * @example
 * ```typescript
 * import { storeObject, keyValidation } from 'ls-proxy'
 *
 * const myObj = storeObject(
 *   'myObj',
 *   { foo: 'bar' },
 *   { validate: value => keyValidation(value, ['foo']) },
 * )
 *
 * myObj.foo = 'abc' // no error
 * myObj.bar = 'xyz' // error
 * ```
 */
const keyValidation = (value, requiredKeys) => Object.keys(value).every(key => requiredKeys.includes(key)) &&
    requiredKeys.every(key => key in value);
exports.keyValidation = keyValidation;
const defaultStoreObjectConfig = ({ checkGets, validate, modify, parse, stringify, }) => {
    return {
        checkGets: checkGets !== null && checkGets !== void 0 ? checkGets : true,
        validate: validate !== null && validate !== void 0 ? validate : (() => true),
        modify: modify !== null && modify !== void 0 ? modify : (value => value),
        parse: parse !== null && parse !== void 0 ? parse : JSON.parse,
        stringify: stringify !== null && stringify !== void 0 ? stringify : JSON.stringify,
    };
};
/**
 * Store a stringified JSON object in localStorage.
 * This method can use any type that can be serialized.
 * The object stored in localStorage is **not** checked for validity by default,
 * but you can pass an argument with your own function to do so
 *
 * @param lsKey The localStorage key to store the stringified object in
 * @param defaults The default values if the object is not stored
 * @param configuration Config options
 *
 * @example
 * ```typescript
 * // No validation
 * import { storeObject } from 'ls-proxy'
 *
 * // Stored serialized in localStorage under the key `myObject`
 * // Note that types other than string can be used
 * const myPerson = storeObject('myObject', {
 *   name: 'John',
 *   age: 21,
 *   interests: ['programming'],
 * })
 *
 * myPerson.name = 'Joe' // Updates localStorage
 * console.log(myPerson.name) // Checks localStorage if checkGets is true
 * ```
 *
 * @example
 * ```typescript
 * // Validating that the expected keys exist and are the correct type
 * import { storeObject, keyValidation } from 'ls-proxy'
 *
 * const myObj = storeObject(
 *   'myObj',
 *   {
 *     someString: 'string',
 *     someNumber: 42,
 *   },
 *   {
 *     validate(value) {
 *       if (!keyValidation(value, ['someString', 'someNumber'])) return false
 *       if (typeof value.someString !== 'string') return false
 *       if (typeof value.someNumber !== 'number') return false
 *       return true
 *     },
 *   },
 * )
 * ```
 *
 * @example
 * ```typescript
 * // Validation to automatically change a key based on another
 * import { storeObject } from 'ls-proxy'
 *
 * interface Person {
 *   name: string
 *   age: number
 *   minor: boolean
 * }
 *
 * const myPerson = storeObject(
 *   'myPerson',
 *   {
 *     name: 'Ellie',
 *     age: 17,
 *     minor: true,
 *   } as Person,
 *   {
 *     // If the person's age is 18 or greater, set minor to false.
 *     // Otherwise, set it to true.
 *     // This will affect values as they're being stored in localStorage
 *     // and retrieved from it
 *     validate(value) {
 *       if (value.age >= 18) value.minor = false
 *       else value.minor = true
 *       return value
 *     },
 *   },
 * )
 *
 * myPerson.age = 18
 * console.log(myPerson.minor) // false
 * myPerson.age = 16
 * console.log(myPerson.minor) // true
 * ```
 */
function storeObject(lsKey, defaults, configuration = {}) {
    const { checkGets, validate, modify, parse, stringify } = defaultStoreObjectConfig(configuration);
    const checkParse = (value) => {
        const parsed = parse(value);
        const valid = validOrThrow(validate, modify, parsed, 'get', lsKey);
        return valid;
    };
    const checkStringify = (value) => stringify(validOrThrow(validate, modify, value, 'set', lsKey));
    let object = Object.assign({}, defaults);
    // Update localStorage value
    if (!localStorage[lsKey]) {
        localStorage[lsKey] = checkStringify(defaults);
    }
    else
        object = checkParse(localStorage[lsKey]);
    return new Proxy(object, {
        set(target, key, value, receiver) {
            const setResult = Reflect.set(target, key, value, receiver);
            localStorage[lsKey] = checkStringify(target);
            return setResult;
        },
        get(target, key, receiver) {
            var _a;
            if (checkGets)
                target[key] = (_a = checkParse(localStorage[lsKey])[key]) !== null && _a !== void 0 ? _a : defaults[key];
            return Reflect.get(target, key, receiver);
        },
    });
}
exports.storeObject = storeObject;
/**
 * Validate and modify an object
 *
 * @param validate Return from the validate function
 * @param modify Function to modify the object
 * @param object The object to modify
 * @param action Whether the object is being get or set
 * @param lsKey The key in localStorage
 * @returns The object if valid
 */
const validOrThrow = (validate, modify, object, action, lsKey) => {
    const error = new TypeError(action === 'get'
        ? `Validation failed while parsing ${lsKey} from localStorage`
        : `Validation failed while setting to ${lsKey} in localStorage`);
    const valid = validate(object);
    // Throw error on failure
    if (typeof valid === 'boolean') {
        // Return is bool
        if (!valid)
            throw error;
    }
    else if (Array.isArray(valid)) {
        // Return is array
        if (!valid[0]) {
            if (valid.length === 2)
                throw valid[1];
            else
                throw error;
        }
    }
    return modify(object);
};
const defaultStoreSeparateConfig = ({ id, checkGets, }) => {
    return {
        id,
        checkGets: checkGets !== null && checkGets !== void 0 ? checkGets : true,
    };
};
/**
 * Set multiple individual keys in localStorage with one object.
 * Note that all values must be strings for this method
 *
 * @param defaults The defaults values if they are undefined
 * @param configuration Config options
 *
 * @example
 * ```typescript
 * import { storeSeparate } from 'ls-proxy'
 *
 * const myObj = storeSeparate({
 *   foo: 'bar',
 * })
 *
 * myObj.foo = 'baz' // Updates localStorage
 * console.log(myObj.foo) // Checks localStorage if checkGets is true
 * ```
 */
function storeSeparate(defaults, configuration = {}) {
    const { id, checkGets } = defaultStoreSeparateConfig(configuration);
    const object = Object.assign({}, defaults);
    // Set defaults
    for (const [key, value] of Object.entries(defaults)) {
        const keyPrefix = addId(key, id);
        if (!localStorage[keyPrefix])
            localStorage[keyPrefix] = value;
        else
            object[key] = localStorage[keyPrefix];
    }
    return new Proxy(object, {
        set(target, key, value, receiver) {
            localStorage[addId(key, id)] = value;
            return Reflect.set(target, key, value, receiver);
        },
        get(target, key, receiver) {
            var _a;
            if (checkGets)
                target[key] = (_a = localStorage[addId(key, id)]) !== null && _a !== void 0 ? _a : defaults[key];
            return Reflect.get(target, key, receiver);
        },
    });
}
exports.storeSeparate = storeSeparate;
const addId = (key, id) => id ? `${id}.${key}` : key;

})();

window.LSProxy = __webpack_exports__;
/******/ })()
;