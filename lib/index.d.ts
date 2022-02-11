/** Configuration for storeObject */
export interface StoreObjectConfig<Object extends Record<string, any> = never> {
    /**
     * Whether or not to check localStorage when an object key is retrieved
     * @default true
     */
    checkGets?: boolean;
    /**
     * Validate an object before setting it in localStorage or reading it.
     * Can confirm/deny if the object is valid, or modify the object before passing it on.
     * See validation examples in the examples/ directory or in the documentation for `storeObject`
     *
     * @returns A boolean to confirm validity, false and an Error instance to deny validity,
     * or return true alongside an object to pass on instead of the original
     * @default keyValidation
     */
    validate?: (value: any) => Object | boolean | readonly [boolean] | readonly [false, Error];
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
export declare const keyValidation: <Obj extends Record<string, any>>(value: any, requiredKeys: readonly string[]) => boolean | readonly [boolean] | readonly [false, Error] | Obj;
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
 *
 * @example
 * ```typescript
 * // Validation to automatically change a key based on another
 * import { storeObject } from 'ls-proxy'
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
export declare function storeObject<Keys extends string = string, Object extends Record<Keys, any> = Record<Keys, any>>(lsKey: string, defaults: Readonly<Object>, configuration?: StoreObjectConfig<Object>): Object;
/** Configuration for storeSeparate */
export interface StoreSeparateConfig {
    /**
     * An optional unique identifier. Prefixes all keys in localStorage
     * with this id (eg. stores `foo` in localStorage as `myid.foo` for `myid`)
     */
    id?: string;
    /**
     * Whether or not to check localStorage when an object key is retrieved
     * @default true
     */
    checkGets?: boolean;
}
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
export declare function storeSeparate<Keys extends string = string, Object extends Record<Keys, string> = Record<Keys, string>>(defaults: Readonly<Object>, configuration?: StoreSeparateConfig): Object;

export as namespace LSProxy;
