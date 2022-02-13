declare type Keys<O extends Record<string, any>> = keyof O & string;
/** Configuration for storeObject */
export interface StoreObjectConfig<O extends Record<string, any>> {
    /**
     * Whether or not to check localStorage when an object key is retrieved
     * @default true
     */
    checkGets?: boolean;
    /**
     * Validate an object before setting it in localStorage or reading it.
     * Can confirm/deny if the object is valid, along with an optional error message if it is not
     *
     * @returns A boolean to confirm validity, false and an Error instance to deny validity,
     * or return true alongside an object to pass on instead of the original
     * @default () => true
     */
    validate?(value: Readonly<any>): boolean | readonly [boolean] | readonly [false, Error];
    /**
     * Modify an object before setting it in localStorage or reading it.
     * Called after validate. Any valiation should be done in validate and not here
     *
     * @returns A boolean to confirm validity, false and an Error instance to deny validity,
     * or return true alongside an object to pass on instead of the original
     */
    modify?(value: O): O;
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
 *
 * @example
 * ```typescript
 * import { storeObject, validateKeys } from 'ls-proxy'
 *
 * const myObj = storeObject(
 *   'myObj',
 *   { foo: 'bar' },
 *   { validate: value => validateKeys(value, ['foo']) },
 * )
 *
 * myObj.foo = 'abc' // no error
 * myObj.bar = 'xyz' // error
 * ```
 */
export declare const validateKeys: <O extends Record<string, any>>(value: Readonly<any>, requiredKeys: readonly string[]) => boolean | readonly [boolean] | readonly [false, Error];
/**
 * Validate that the types passed for an object are expected.
 * Meant to be used in a validate function for `storeObject`
 *
 * @param value The unknown value to validate types of
 * @param typesMap A map of expected keys for an object to expected types, checked like `typeof value[key] === typesMap[key]`
 * @example
 * ```typescript
 * import { storeObject, validateTypes } from 'ls-proxy'
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
 *   { validate: value => validateTypes(value, typesMap) },
 * )
 *
 * runtimeCheckedTypes.onlyString = 'xyz' // Succeeds
 * runtimeCheckedTypes.onlyNumber = 'abc' // Fails
 * ```
 */
export declare const validateTypes: <O extends Record<string, any>>(value: Readonly<any>, typesMap: Record<Keys<O>, string>) => boolean;
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
export declare function storeObject<O extends Record<string, any> = Record<string, any>>(lsKey: string, defaults: Readonly<O>, configuration?: StoreObjectConfig<O>): O;
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
export declare function storeSeparate<O extends Record<string, string> = Record<string, string>>(defaults: Readonly<O>, configuration?: StoreSeparateConfig): O;
export {};

export as namespace LSProxy;
