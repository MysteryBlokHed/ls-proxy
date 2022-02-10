"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keyProxy = exports.jsonProxy = void 0;
const defaultJsonProxyConfig = ({ setDefault, checkGets, parse, stringify, }) => {
    return {
        setDefault: setDefault !== null && setDefault !== void 0 ? setDefault : false,
        checkGets: checkGets !== null && checkGets !== void 0 ? checkGets : true,
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
 */
function jsonProxy(lsKey, defaults, configuration = {}) {
    const { setDefault, checkGets, parse, stringify } = defaultJsonProxyConfig(configuration);
    let object = Object.assign({}, defaults);
    // Update localStorage value
    if (setDefault && !localStorage[lsKey])
        localStorage[lsKey] = stringify(defaults);
    else
        object = parse(localStorage[lsKey]);
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
const defaultKeyProxyConfig = ({ setDefaults, checkGets, }) => {
    return {
        setDefaults: setDefaults !== null && setDefaults !== void 0 ? setDefaults : true,
        checkGets: checkGets !== null && checkGets !== void 0 ? checkGets : true,
    };
};
/**
 * Get a Proxy that sets multiple individual keys in localStorage.
 * Note that all values must be strings for this method
 *
 * @param defaults The defaults values if they are undefined
 * @param id An optional unique identifier. Prefixes all keys in localStorage
 * with this id (eg. stores `foo` in localStorage as `myid.foo` for `myid`)
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
function keyProxy(defaults, id, configuration = {}) {
    const { setDefaults, checkGets } = defaultKeyProxyConfig(configuration);
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
