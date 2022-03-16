import type { Keys } from './types';
export { default as Validations } from './validations';
/**
 * Configuration options used between both storeObject and storeSeparate
 */
interface CommonConfig {
    /**
     * Whether or not to check localStorage when an object key is retrieved
     * @default true
     */
    checkGets?: boolean;
    /**
     * Called whenever a key should be set
     * @param value The value being set
     * @default localStorage.setItem
     */
    set?(key: string, value: string): void;
    /**
     * Called whenever a key should be retrieved
     * @param value The value being set
     * @returns The key's value
     */
    get?(key: string): string | null;
    /**
     * Function to parse object. Defaults to `JSON.parse`.
     * Any validation should **NOT** be done here, but in the validate method
     * @default JSON.parse
     */
    parse?: (value: string) => any;
    /**
     * Function to stringify object. Defaults to `JSON.stringify`.
     * Any validation should **NOT** be done here, but in the validate method
     * @default JSON.stringify
     */
    stringify?: (value: any) => string;
}
/**
 * Configuration for StoreObjectConfig
 * @template O The stored object
 */
export interface StoreObjectConfig<O extends Record<string, any>> extends CommonConfig {
    /**
     * Whether the stored object only contains/stores *some* of the keys on the serialized object.
     * This is useful if you want an object to look at only some keys of a localStorage object
     * without overwriting the other ones.
     *
     * It's important to note that passing this option effectively enables key validation:
     * any keys that were not passed are ignored and not passed to validate or modify
     * @default false
     */
    partial?: boolean;
    /**
     * Validate an object before setting it in localStorage or reading it.
     * Can confirm/deny if the object is valid, along with an optional error message if it is not
     *
     * @returns A boolean to confirm validity or false and optionally an Error instance to deny validity
     */
    validate?(value: Readonly<any>, action: 'get' | 'set'): boolean | readonly [boolean] | readonly [false, Error];
    /**
     * Modify an object before setting it in localStorage or reading it.
     * Called after validate. Any valiation should be done in validate and not here
     *
     * @returns A potentially modified version of the object originally passed
     */
    modify?(value: O, action: 'get' | 'set'): O;
}
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
export declare function storeObject<O extends Record<string, any> = Record<string, any>>(lsKey: string, defaults: O, configuration?: StoreObjectConfig<O>): O;
/**
 * Configuration for storeSeparate
 */
export interface StoreSeparateConfig<O extends Record<string, any>> extends CommonConfig {
    /**
     * An optional unique identifier. Prefixes all keys in localStorage
     * with this id (eg. stores `foo` in localStorage as `myid.foo` for `myid`)
     */
    id?: string;
    /**
     * Validate an object before setting it in localStorage or reading it.
     * Can confirm/deny if the object is valid, along with an optional error message if it is not
     *
     * @returns A boolean to confirm validity or false and optionally an Error instance to deny validity
     */
    validate?(value: Readonly<any>, action: 'get' | 'set', key: Keys<O>): boolean | readonly [boolean] | readonly [false, Error];
    /**
     * Modify an object before setting it in localStorage or reading it.
     * Called after validate. Any valiation should be done in validate and not here
     *
     * @returns A potentially modified version of the object originally passed
     */
    modify?(value: O, action: 'get' | 'set', key: Keys<O>): O;
}
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
export declare function storeSeparate<O extends Record<string, any> = Record<string, any>>(defaults: O, configuration?: StoreSeparateConfig<O>): O;

export as namespace LSProxy;
