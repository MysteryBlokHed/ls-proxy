"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeSeparate = exports.storeObject = exports.Validations = void 0;
var validations_1 = require("./validations");
Object.defineProperty(exports, "Validations", { enumerable: true, get: function () { return validations_1.default; } });
const setObj = (target, newObj) => Object.entries(newObj).forEach(([k, v]) => (target[k] = v));
/**
 * Fill in default values for CommonConfig
 */
const commonDefaults = ({ checkGets, set, get, parse, stringify, }) => ({
    checkGets: checkGets !== null && checkGets !== void 0 ? checkGets : true,
    set: set !== null && set !== void 0 ? set : ((key, value) => (localStorage[key] = value)),
    get: get !== null && get !== void 0 ? get : (value => { var _a; return (_a = localStorage[value]) !== null && _a !== void 0 ? _a : null; }),
    parse: parse !== null && parse !== void 0 ? parse : JSON.parse,
    stringify: stringify !== null && stringify !== void 0 ? stringify : JSON.stringify,
});
/**
 * Fill in default values for StoreObjectConfig
 * @template O The stored object
 */
const defaultStoreObjectConfig = ({ checkGets, partial, set, get, validate, modify, parse, stringify, }) => (Object.assign({ partial: partial !== null && partial !== void 0 ? partial : false, validate: validate !== null && validate !== void 0 ? validate : (() => true), modify: modify !== null && modify !== void 0 ? modify : (value => value) }, commonDefaults({ checkGets, set, get, parse, stringify })));
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
const validateResult = (valid, defaultError) => {
    // Throw error on failure
    if (typeof valid === 'boolean') {
        // Return is bool
        if (!valid)
            return [valid, defaultError];
        return [valid];
    }
    else {
        // Return is array
        if (!valid[0]) {
            if (valid.length === 2)
                return [valid[0], valid[1]];
            else
                return [valid[0], defaultError];
        }
        return [valid[0]];
    }
};
/**
 * Validate and modify an object
 *
 * @param validate Function to validate the object
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
    const valid = validateResult(validate(object, action), error);
    if (!valid[0])
        throw valid[1];
    return modify(object, action);
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
const defaultStoreSeparateConfig = ({ id, checkGets, set, get, validate, modify, parse, stringify, }) => (Object.assign({ id, validate: validate !== null && validate !== void 0 ? validate : (() => true), modify: modify !== null && modify !== void 0 ? modify : (value => value) }, commonDefaults({ checkGets, set, get, parse, stringify })));
/**
 * Validate and modify a value
 *
 * @param validate Function to validate the object
 * @param modify Function to modify the object
 * @param object The object to modify
 * @param action Whether the object is being get or set
 * @param key The key being validated/modified
 * @template O The stored object
 * @returns The value, if valid
 */
const validOrThrowSeparate = (validate, modify, object, action, key) => {
    const error = new TypeError(action === 'get'
        ? `Validation failed while parsing ${key} from localStorage`
        : `Validation failed while setting to ${key} in localStorage`);
    const valid = validateResult(validate(object, action, key), error);
    if (!valid[0])
        throw valid[1];
    return modify(object, action, key);
};
/**
 * Set multiple individual keys in localStorage with one object
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
    const { id, checkGets, set, get, validate, modify, parse, stringify } = defaultStoreSeparateConfig(configuration);
    const object = Object.assign({}, defaults);
    /** Call validOrThrow with relevant parameters by default */
    const vot = (key, value, action) => validOrThrowSeparate(validate, modify, { [key]: value }, action, key)[key];
    // Set defaults
    for (const [key, value] of Object.entries(defaults)) {
        const keyPrefix = addId(key, id);
        const lsValue = get(keyPrefix);
        if (!lsValue) {
            set(keyPrefix, stringify(vot(key, value, 'set')));
        }
        else
            object[key] = vot(parse(lsValue), key, 'get');
    }
    return new Proxy(object, {
        set(target, key, value) {
            // Modify object
            const modified = vot(key, value, 'set');
            set(addId(key, id), stringify(modified));
            return Reflect.set(target, key, modified);
        },
        get(target, key) {
            if (checkGets) {
                const valueUnparsed = get(addId(key, id));
                const value = valueUnparsed ? parse(valueUnparsed) : defaults[key];
                target[key] = vot(key, value, 'get');
            }
            if (shouldObjectProxy(target[key])) {
                // Return a Proxy to the object to catch sets
                return nestedProxyHandler(target, key, target[key], this.set);
            }
            return Reflect.get(target, key);
        },
    });
}
exports.storeSeparate = storeSeparate;
const addId = (key, id) => id ? `${id}.${key}` : key;
