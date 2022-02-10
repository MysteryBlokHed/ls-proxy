// ==UserScript==
// @name        ls-proxy
// @descripton  Wraps localStorage to easily store any value
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
exports.keyProxy = exports.jsonProxy = void 0;
/**
 * Get a Proxy that stores a stringified JSON object in localStorage.
 * This method can use any type that can be serialized.
 * The object stored in localStorage is **not** checked for validity
 *
 * @param lsKey The localStorage key to store the stringified object in
 * @param defaults The default values if the object is not stored
 * @param setDefault Whether or not to immediately store the stringified object in localStorage
 * if it is undefined
 * @param checkGets Whether or not to check localStorage when an object key is retrieved
 * @param replacer Passed to `JSON.stringify` if provided. See `JSON.stringify` docs for more info
 * @param reviver Passed to `JSON.parse` if provided. See `JSON.parse` docs for more info
 *
 * @example
 * ```typescript
 * import { jsonProxy } from 'ls-proxy'
 *
 * // Stored serialized in localStorage under the key `myObject`
 * // Note that types other than string can be used
 * const myPerson = jsonProxy('myObject', {
 *   name: 'John',
 *   age: 21,
 *   interests: ['programming'],
 *   minor: false,
 * })
 *
 * myPerson.name = 'Joe' // Updates localStorage
 * console.log(myPerson.name) // Checks localStorage if checkGets is true
 * ```
 */
function jsonProxy(lsKey, defaults, setDefault = true, checkGets = true, replacer, reviver) {
    // Automatically pass replacer/reviver to JSON functions
    const stringify = (value) => JSON.stringify(value, replacer);
    const parse = (value) => JSON.parse(value, reviver);
    let object = Object.assign({}, defaults);
    // Update localStorage value
    if (setDefault && !localStorage[lsKey])
        localStorage[lsKey] = stringify(defaults);
    else
        object = JSON.parse(localStorage[lsKey]);
    return new Proxy(object, {
        set(target, key, value, receiver) {
            const setResult = Reflect.set(target, key, value, receiver);
            localStorage[lsKey] = stringify(target);
            return setResult;
        },
        get(target, key, receiver) {
            var _a;
            if (checkGets)
                target[key] = (_a = parse(localStorage[lsKey])[key]) !== null && _a !== void 0 ? _a : defaults[key];
            return Reflect.get(target, key, receiver);
        },
    });
}
exports.jsonProxy = jsonProxy;
/**
 * Get a Proxy that sets multiple individual keys in localStorage.
 * Note that all values must be strings for this method
 *
 * @param defaults The defaults values if they are undefined
 * @param id An optional unique identifier. Prefixes all keys in localStorage
 * with this id (eg. stores `foo` in localStorage as `myid.foo` for `myid`)
 * @param setDefaults Whether or not to set the defaults in localStorage if they are not defined
 * @param checkGets Whether or not to check localStorage when an object key is retrieved
 *
 * @example
 * ```typescript
 * import { keyProxy } from 'ls-proxy'
 *
 * const myObj = keyProxy({
 *   foo: 'bar',
 * })
 *
 * myObj.foo = 'baz' // Updates localStorage
 * console.log(myObj.foo) // Checks localStorage if checkGets is true
 * ```
 */
function keyProxy(defaults, id, setDefaults = false, checkGets = true) {
    const object = Object.assign({}, defaults);
    if (setDefaults) {
        for (const [key, value] of Object.entries(defaults)) {
            const keyPrefix = addId(key, id);
            if (!localStorage[keyPrefix]) {
                if (setDefaults)
                    localStorage[keyPrefix] = value;
            }
            else
                object[key] = localStorage[keyPrefix];
        }
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
exports.keyProxy = keyProxy;
const addId = (key, id) => (id ? `${id}.key` : key);

})();

window.LSProxy = __webpack_exports__;
/******/ })()
;