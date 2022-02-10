/**
 * Get a Proxy that stores a stringified JSON object in localStorage.
 * This method can use any type that can be serialized.
 * The object stored in localStorage is **not** checked for validity by default,
 * but you can pass an argument with your own function to do so
 *
 * @param lsKey The localStorage key to store the stringified object in
 * @param defaults The default values if the object is not stored
 * @param setDefault Whether or not to immediately store the stringified object in localStorage
 * if it is undefined
 * @param checkGets Whether or not to check localStorage when an object key is retrieved
 * @param parse Function to parse object. Can be replaced with a custom function
 * to validate objects before setting/getting. Defaults to `JSON.parse`
 * @param stringify Function to stringify object. Defaults to `JSON.stringify`
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
export declare function jsonProxy<Keys extends string = string, Object extends Record<Keys, any> = Record<Keys, any>>(lsKey: string, defaults: Readonly<Object>, setDefault?: boolean, checkGets?: boolean, parse?: (value: string) => Object, stringify?: (value: any) => string): Object;
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
export declare function keyProxy<Keys extends string = string, Object extends Record<Keys, string> = Record<Keys, string>>(defaults: Readonly<Object>, id?: string, setDefaults?: boolean, checkGets?: boolean): Object;

export as namespace LSProxy;
