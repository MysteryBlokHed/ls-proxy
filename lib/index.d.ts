/** Configuration for jsonProxy */
export interface JsonProxyConfig<Object extends Record<string, any>> {
    /**
     * Whether or not to immediately store the stringified object in localStorage
     * if it is undefined
     * @default true
     */
    setDefault?: boolean;
    /**
     * Whether or not to check localStorage when an object key is retrieved
     * @default true
     */
    checkGets?: boolean;
    /**
     * Validate an object before setting it in localStorage or reading it.
     * Should return true if an object is valid or false otherwise.
     * If the return is false, a TypeError will be thrown from the Proxy
     * @returns Either a boolean or false and an error to throw
     * @default () => true
     */
    validate?: (value: any) => boolean | readonly [boolean] | readonly [false, Error];
    /**
     * Function to parse object. Can be replaced with a custom function
     * to validate objects before setting/getting. Defaults to `JSON.parse`
     * @default JSON.parse
     */
    parse?: (value: string) => any;
    /**
     * Function to stringify object. Defaults to `JSON.stringify`
     * @default JSON.stringify
     */
    stringify?: (value: any) => string;
}
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
export declare function jsonProxy<Keys extends string = string, Object extends Record<Keys, any> = Record<Keys, any>>(lsKey: string, defaults: Readonly<Object>, configuration?: JsonProxyConfig<Object>): Object;
/** Configuration for keyProxy */
export interface KeyProxyConfig {
    /**
     * Whether or not to set the defaults in localStorage if they are not defined
     * @default false
     */
    setDefaults?: boolean;
    /**
     * Whether or not to check localStorage when an object key is retrieved
     * @default true
     */
    checkGets?: boolean;
}
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
export declare function keyProxy<Keys extends string = string, Object extends Record<Keys, string> = Record<Keys, string>>(defaults: Readonly<Object>, id?: string, configuration?: KeyProxyConfig): Object;

export as namespace LSProxy;
