/**
 * Get a Proxy that stores a stringified JSON object in localStorage.
 * This method can use any type that can be serialized.
 * The object stored in localStorage is **not** checked for validity
 *
 * @param lsKey The localStorage key to store the stringified object in
 * @param defaults The default values if the object is not stored
 * @param setDefault Whether or not to immediately store the stringified object in localStorage
 * if it is undefined
 * @param checkGets Whether or not to check localStorage when an object key is retrieved
 * @param replacer Passed to `JSON.stringify` if provided. See `JSON.stringify` docs for more info
 * @param reviver Passed to `JSON.parse` if provided. See `JSON.parse` docs for more info
 *
 * @example
 * ```typescript
 * import { jsonProxy } from 'ls-proxy'
 *
 * // Stored serialized in localStorage under the key `myObject`
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
export function jsonProxy<
  Keys extends string = string,
  Object extends Record<Keys, any> = Record<Keys, any>,
>(
  lsKey: string,
  defaults: Readonly<Object>,
  setDefault = true,
  checkGets = true,
  replacer?: Parameters<typeof JSON['stringify']>[1],
  reviver?: Parameters<typeof JSON['parse']>[1],
): Object {
  // Automatically pass replacer/reviver to JSON functions
  const stringify = (value: any) => JSON.stringify(value, replacer)
  const parse = (value: string) => JSON.parse(value, reviver)

  let object = { ...defaults } as Object

  // Update localStorage value
  if (setDefault && !localStorage[lsKey])
    localStorage[lsKey] = stringify(defaults)
  else object = JSON.parse(localStorage[lsKey])

  return new Proxy(object, {
    set(target, key: Keys, value: string, receiver) {
      const setResult = Reflect.set(target, key, value, receiver)
      localStorage[lsKey] = stringify(target)

      return setResult
    },

    get(target, key: Keys, receiver) {
      if (checkGets)
        target[key] = parse(localStorage[lsKey])[key] ?? defaults[key]

      return Reflect.get(target, key, receiver)
    },
  })
}

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
export function keyProxy<
  Keys extends string = string,
  Object extends Record<Keys, string> = Record<Keys, string>,
>(
  defaults: Readonly<Object>,
  id?: string,
  setDefaults = false,
  checkGets = true,
): Object {
  const object = { ...defaults } as Object

  if (setDefaults) {
    for (const [key, value] of Object.entries(defaults) as [Keys, string][]) {
      const keyPrefix = addId(key, id)
      if (!localStorage[keyPrefix]) localStorage[keyPrefix] = value
      else object[key] = localStorage[keyPrefix]
    }
  }

  return new Proxy(object, {
    set(target, key: Keys, value: string, receiver) {
      localStorage[addId(key, id)] = value
      return Reflect.set(target, key, value, receiver)
    },

    get(target, key: Keys, receiver) {
      if (checkGets) target[key] = localStorage[addId(key, id)] ?? defaults[key]
      return Reflect.get(target, key, receiver)
    },
  })
}

const addId = (key: string, id: string | undefined) => (id ? `${id}.key` : key)
