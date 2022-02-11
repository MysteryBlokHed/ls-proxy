"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeSeparate = exports.storeObject = void 0;
const defaultStoreObjectConfig = ({ checkGets, validate, parse, stringify, }) => {
    return {
        checkGets: checkGets !== null && checkGets !== void 0 ? checkGets : true,
        validate: validate !== null && validate !== void 0 ? validate : (() => true),
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
 * const myObj = storeObject(
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
function storeObject(lsKey, defaults, configuration = {}) {
    const { checkGets, validate, parse, stringify } = defaultStoreObjectConfig(configuration);
    const checkParse = (value) => {
        const parsed = parse(value);
        const valid = validOrThrow(validate(parsed), parsed, 'get', lsKey);
        return valid;
    };
    const checkStringify = (value) => stringify(validOrThrow(validate(value), value, 'set', lsKey));
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
const validOrThrow = (valid, object, action, lsKey) => {
    const error = new TypeError(action === 'get'
        ? `Validation failed while parsing ${lsKey} from localStorage`
        : `Validation failed while setting to ${lsKey} in localStorage`);
    console.log('doing thing with validity', valid, 'and obj', object);
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
    else {
        // Return is a new object
        return valid;
    }
    return object;
};
const defaultStoreSeparateConfig = ({ id, setDefaults, checkGets, }) => {
    return {
        id,
        setDefaults: setDefaults !== null && setDefaults !== void 0 ? setDefaults : false,
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
    const { id, setDefaults, checkGets } = defaultStoreSeparateConfig(configuration);
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
exports.storeSeparate = storeSeparate;
const addId = (key, id) => id ? `${id}.${key}` : key;
