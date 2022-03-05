// ==UserScript==
// @name        ls-proxy
// @descripton  Wrapper around localStorage to easily store JSON objects
// @version     0.3.1
// @author      Adam Thompson-Sharpe
// @license     MIT OR Apache-2.0
// @homepageURL https://gitlab.com/MysteryBlokHed/ls-proxy
// ==/UserScript==

/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./lib/validations.js":
/*!****************************!*\
  !*** ./lib/validations.js ***!
  \****************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
/** Validations meant to be used with `storeObject`'s validate function */
var Validations;
(function (Validations) {
    /**
     * Validate that only expected keys are present on an object
     *
     * @param value The unknown value to validate types of
     * @param requiredKeys The **only** keys that should be present
     * @template O The stored object
     *
     * @example
     * ```typescript
     * import { storeObject, Validations } from 'ls-proxy'
     *
     * const myObj = storeObject(
     *   'myObj',
     *   { foo: 'bar' },
     *   { validate: value => Validations.keys(value, ['foo']) },
     * )
     *
     * myObj.foo = 'abc' // no error
     * myObj.bar = 'xyz' // error
     * ```
     */
    Validations.keys = (value, requiredKeys) => Object.keys(value).every(key => requiredKeys.includes(key)) &&
        requiredKeys.every(key => key in value);
    /**
     * Validate that the types passed for an object are expected
     *
     * @param value The unknown value to validate types of
     * @param typesMap A map of expected keys for an object to expected types, checked like `typeof value[key] === typesMap[key]`
     * @template O The stored object
     * @example
     * ```typescript
     * import { storeObject, Validations } from 'ls-proxy'
     *
     * const typesMap = {
     *   onlyString: 'string',
     *   onlyNumber: 'number',
     * }
     *
     * const runtimeCheckedTypes = storeObject(
     *   'runtimeCheckedTypes',
     *   {
     *     onlyString: 'abc',
     *     onlyNumber: 123,
     *   },
     *   { validate: value => Validations.types(value, typesMap) },
     * )
     *
     * runtimeCheckedTypes.onlyString = 'xyz' // Succeeds
     * runtimeCheckedTypes.onlyNumber = 'abc' // Fails
     * ```
     */
    Validations.types = (value, typesMap) => Object.entries(value).every(([key, value]) => typeof value === typesMap[key]);
})(Validations || (Validations = {}));
exports["default"] = Validations;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!**********************!*\
  !*** ./lib/index.js ***!
  \**********************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.storeSeparate = exports.storeObject = exports.Validations = void 0;
var validations_1 = __webpack_require__(/*! ./validations */ "./lib/validations.js");
Object.defineProperty(exports, "Validations", ({ enumerable: true, get: function () { return validations_1.default; } }));
/**
 * Fill in default values for StoreObjectConfig
 * @template O The stored object
 */
const defaultStoreObjectConfig = ({ checkGets, partial, set, get, validate, modify, parse, stringify, }) => {
    return {
        checkGets: checkGets !== null && checkGets !== void 0 ? checkGets : true,
        partial: partial !== null && partial !== void 0 ? partial : false,
        set: set !== null && set !== void 0 ? set : ((key, value) => (localStorage[key] = value)),
        get: get !== null && get !== void 0 ? get : (value => { var _a; return (_a = localStorage[value]) !== null && _a !== void 0 ? _a : null; }),
        validate: validate !== null && validate !== void 0 ? validate : (() => true),
        modify: modify !== null && modify !== void 0 ? modify : (value => value),
        parse: parse !== null && parse !== void 0 ? parse : JSON.parse,
        stringify: stringify !== null && stringify !== void 0 ? stringify : JSON.stringify,
    };
};
const shouldObjectProxy = (object) => 
// Check that the target isn't falsey (primarily in case it's null, since typeof null === 'object')
object &&
    // Check type
    typeof object === 'object' &&
    // 'object' type includes some unwanted types, so check constructor
    [Object, Array].includes(object.constructor);
/**
 * Proxy handler for deeply nested objects on the main object
 * @template P The parent object
 * @template N The child of the parent
 */
const nestedProxyHandler = (parent, parentKey, nested, parentSet) => {
    return new Proxy(nested, {
        set(target, key, value) {
            const setResult = Reflect.set(target, key, value);
            // Trigger set trap of original object, updating localStorage
            parentSet(parent, parentKey, target, parent);
            return setResult;
        },
        get(target, key) {
            if (shouldObjectProxy(target[key])) {
                // Return a Proxy to the object to catch sets
                return nestedProxyHandler(target, key, Reflect.get(target, key), this.set);
            }
            return Reflect.get(target, key);
        },
    });
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
 * @template O The stored object
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
 * import { storeObject, validateKeys } from 'ls-proxy'
 *
 * const myObj = storeObject(
 *   'myObj',
 *   {
 *     someString: 'string',
 *     someNumber: 42,
 *   },
 *   {
 *     validate(value) {
 *       if (!validateKeys(value, ['someString', 'someNumber'])) return false
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
 * // Automatically change a key based on another
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
    const { checkGets, partial, set, get, validate, modify, parse, stringify } = defaultStoreObjectConfig(configuration);
    /** Call validOrThrow with relevant parameters by default */
    const vot = (value, action = 'set') => validOrThrow(validate, modify, value, action, lsKey);
    const checkParse = (value) => {
        const parsed = parse(value);
        const valid = vot(parsed, 'get');
        return valid;
    };
    const checkStringify = (value) => stringify(vot(value));
    const filterWanted = (obj, defaultIfUndefined = true) => {
        let desiredObject = {};
        Object.keys(defaults).forEach(
        // Set to value found in localStorage if it exists, otherwise use provided default
        key => {
            var _a;
            return (desiredObject[key] = defaultIfUndefined
                ? // Use default if defaultInDefined
                    (_a = obj[key]) !== null && _a !== void 0 ? _a : defaults[key]
                : // Use given value even if undefined
                    obj[key]);
        });
        return desiredObject;
    };
    let object = Object.assign({}, defaults);
    // Update localStorage value or read existing values
    const value = get(lsKey);
    if (!value) {
        set(lsKey, checkStringify(defaults));
    }
    else if (partial) {
        const current = parse(value);
        object = filterWanted(current);
        const validModified = vot(object);
        set(lsKey, stringify(Object.assign(Object.assign({}, current), validModified)));
    }
    else {
        object = checkParse(value);
    }
    /** Proxy handler for the main object */
    const proxyHandler = {
        set(target, key, value) {
            const setResult = Reflect.set(target, key, value);
            if (partial) {
                const validModified = vot(target);
                set(lsKey, stringify(Object.assign(Object.assign({}, parse(get(lsKey))), validModified)));
            }
            else
                set(lsKey, checkStringify(target));
            return setResult;
        },
        get(target, key) {
            var _a;
            if (checkGets) {
                if (partial) {
                    target[key] = vot(filterWanted(parse(get(lsKey)), false), 'get')[key];
                    vot(target, 'get');
                }
                else {
                    target[key] = (_a = checkParse(get(lsKey))[key]) !== null && _a !== void 0 ? _a : defaults[key];
                }
                if (shouldObjectProxy(target[key])) {
                    // Return a Proxy to the object to catch sets
                    return nestedProxyHandler(target, key, target[key], this.set);
                }
            }
            return Reflect.get(target, key);
        },
    };
    return new Proxy(object, proxyHandler);
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
 * @template O The stored object
 * @returns The object if valid
 */
const validOrThrow = (validate, modify, object, action, lsKey) => {
    const error = new TypeError(action === 'get'
        ? `Validation failed while parsing ${lsKey} from localStorage`
        : `Validation failed while setting to ${lsKey} in localStorage`);
    const valid = validate(object, action);
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
    return modify(object, action);
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
 * @template O The stored object
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
        set(target, key, value) {
            localStorage[addId(key, id)] = value;
            return Reflect.set(target, key, value);
        },
        get(target, key) {
            var _a;
            if (checkGets)
                target[key] = (_a = localStorage[addId(key, id)]) !== null && _a !== void 0 ? _a : defaults[key];
            return Reflect.get(target, key);
        },
    });
}
exports.storeSeparate = storeSeparate;
const addId = (key, id) => id ? `${id}.${key}` : key;

})();

window.LSProxy = __webpack_exports__;
/******/ })()
;