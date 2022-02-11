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
const defaultJsonProxyConfig = ({ checkGets, validate, parse, stringify, }) => {
    return {
        checkGets: checkGets !== null && checkGets !== void 0 ? checkGets : true,
        validate: validate !== null && validate !== void 0 ? validate : (() => true),
        parse: parse !== null && parse !== void 0 ? parse : JSON.parse,
        stringify: stringify !== null && stringify !== void 0 ? stringify : JSON.stringify,
    };
};
/**
 * Get a Proxy that stores a stringified JSON object in localStorage.
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
 *
 * @example
 * ```typescript
 * // Validating that the expected keys exist and are the correct type
 * const myObj = jsonProxy(
 *   'myObj',
 *   {
 *     someString: 'string',
 *     someNumber: 42,
 *   },
 *   {
 *     validate(value) {
 *       if (typeof value.someString !== 'string') return false
 *       if (typeof value.someNumber !== 'number') return false
 *       return true
 *     },
 *   },
 * )
 * ```
 */
function jsonProxy(lsKey, defaults, configuration = {}) {
    const { checkGets, validate, parse, stringify } = defaultJsonProxyConfig(configuration);
    const checkParse = (value) => {
        const parsed = parse(value);
        const valid = validate(parsed);
        validOrThrow(valid, 'get', lsKey);
        return parsed;
    };
    const checkStringify = (value) => {
        const valid = validate(value);
        validOrThrow(valid, 'set', lsKey);
        return stringify(value);
    };
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
exports.jsonProxy = jsonProxy;
const validOrThrow = (valid, action, lsKey) => {
    const error = new TypeError(action === 'get'
        ? `Validation failed while parsing ${lsKey} from localStorage`
        : `Validation failed while setting to ${lsKey} in localStorage`);
    // Throw error on failure
    if (typeof valid === 'boolean') {
        if (!valid)
            throw error;
    }
    else if (!valid[0]) {
        if (valid.length === 2)
            throw valid[1];
        else
            throw error;
    }
};
const defaultKeyProxyConfig = ({ id, setDefaults, checkGets, }) => {
    return {
        id,
        setDefaults: setDefaults !== null && setDefaults !== void 0 ? setDefaults : false,
        checkGets: checkGets !== null && checkGets !== void 0 ? checkGets : true,
    };
};
/**
 * Get a Proxy that sets multiple individual keys in localStorage.
 * Note that all values must be strings for this method
 *
 * @param defaults The defaults values if they are undefined
 * @param configuration Config options
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
function keyProxy(defaults, configuration = {}) {
    const { id, setDefaults, checkGets } = defaultKeyProxyConfig(configuration);
    const object = Object.assign({}, defaults);
    if (setDefaults) {
        for (const [key, value] of Object.entries(defaults)) {
            const keyPrefix = addId(key, id);
            if (!localStorage[keyPrefix])
                localStorage[keyPrefix] = value;
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
const addId = (key, id) => id ? `${id}.${key}` : key;

})();

window.LSProxy = __webpack_exports__;
/******/ })()
;