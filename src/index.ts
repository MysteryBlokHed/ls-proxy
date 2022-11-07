import type { Keys } from './types'

export { default as Validations } from './validations'

/**
 * Configuration options used between both storeObject and storeSeparate
 */
interface CommonConfig {
  /**
   * Whether or not to check localStorage when an object key is retrieved
   * @default true
   */
  checkGets?: boolean
  /**
   * Whether or not to look for existing values before using the defaults passed
   * @default true
   */
  checkDefaults?: boolean

  /**
   * Called whenever a key should be set
   * @param value The value being set
   * @default localStorage.setItem
   */
  set?(key: string, value: string): void
  /**
   * Called whenever a key should be retrieved
   * @param value The value being set
   * @returns The key's value
   */
  get?(key: string): string | null
  /**
   * Function to parse object. Defaults to `JSON.parse`.
   * Any validation should **NOT** be done here, but in the validate method
   * @default JSON.parse
   */
  parse?: (value: string) => any
  /**
   * Function to stringify object. Defaults to `JSON.stringify`.
   * Any validation should **NOT** be done here, but in the validate method
   * @default JSON.stringify
   */
  stringify?: (value: any) => string
}

/**
 * Fill in default values for CommonConfig
 */
const commonDefaults = ({
  checkGets,
  checkDefaults,
  set,
  get,
  parse,
  stringify,
}: CommonConfig): Required<CommonConfig> => ({
  checkGets: checkGets ?? true,
  checkDefaults: checkDefaults ?? true,
  set: set ?? ((key, value) => (localStorage[key] = value)),
  get: get ?? (value => localStorage[value] ?? null),
  parse: parse ?? JSON.parse,
  stringify: stringify ?? JSON.stringify,
})

/**
 * Configuration for StoreObjectConfig
 * @template O The stored object
 */
export interface StoreObjectConfig<O extends Record<string, any>>
  extends CommonConfig {
  /**
   * Whether the stored object only contains/stores *some* of the keys on the serialized object.
   * This is useful if you want an object to look at only some keys of a localStorage object
   * without overwriting the other ones.
   *
   * It's important to note that passing this option effectively enables key validation:
   * any keys that were not passed are ignored and not passed to validate or modify
   * @default false
   */
  partial?: boolean

  /**
   * Validate an object before setting it in localStorage or reading it.
   * Can confirm/deny if the object is valid, along with an optional error message if it is invalid
   *
   * @returns A boolean to confirm validity or false and optionally an Error instance to deny validity
   */
  validate?(
    value: Readonly<any>,
    action: 'get' | 'set',
  ): boolean | readonly [boolean] | readonly [false, Error]
  /**
   * Modify an object before setting it in localStorage or reading it.
   * Called after validate. Any valiation should be done in validate and not here
   *
   * @returns A potentially modified version of the object originally passed
   */
  modify?(value: O, action: 'get' | 'set'): O
}

/**
 * Fill in default values for StoreObjectConfig
 * @template O The stored object
 */
const defaultStoreObjectConfig = <O extends Record<string, any>>({
  checkGets,
  partial,
  set,
  get,
  validate,
  modify,
  parse,
  stringify,
}: StoreObjectConfig<O>): Required<StoreObjectConfig<O>> => ({
  partial: partial ?? false,
  validate: validate ?? (() => true),
  modify: modify ?? (value => value),
  ...commonDefaults({ checkGets, set, get, parse, stringify }),
})

const shouldObjectProxy = (object: any) =>
  // Check that the target isn't falsey (primarily in case it's null, since typeof null === 'object')
  object &&
  // Check type
  typeof object === 'object' &&
  // 'object' type includes some unwanted types, so check constructor
  [Object, Array].includes(object.constructor)

/**
 * Proxy handler for deeply nested objects on the main object
 * @template P The parent object
 * @template N The child of the parent
 */
const nestedProxyHandler = <
  P extends Record<string, any>,
  N extends Record<string, any>,
>(
  parent: P,
  parentKey: Keys<P>,
  nested: N,
  parentSet: Required<ProxyHandler<P>>['set'],
): ProxyHandler<N> => {
  return new Proxy(nested, {
    set(target, key: Keys<N>, value) {
      const setResult = Reflect.set(target, key, value)

      // Trigger set trap of original object, updating localStorage
      parentSet(parent, parentKey, target, parent)

      return setResult
    },

    get(target, key: Keys<N>) {
      if (shouldObjectProxy(target[key])) {
        // Return a Proxy to the object to catch sets
        return nestedProxyHandler(
          target,
          key,
          Reflect.get(target, key),
          this.set! as any,
        )
      }
      return Reflect.get(target, key)
    },
  })
}

const validateResult = (
  valid: ReturnType<Required<StoreObjectConfig<never>>['validate']>,
  defaultError: Error,
): [true] | [false, Error] => {
  // Throw error on failure
  if (typeof valid === 'boolean') {
    // Return is bool
    if (!valid) return [valid, defaultError]
    return [valid]
  } else {
    // Return is array
    if (!valid[0]) {
      if (valid.length === 2) return [valid[0], valid[1]]
      else return [valid[0], defaultError]
    }
    return [valid[0]]
  }
}

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
const validOrThrow = <O extends Record<string, any>>(
  validate: Required<StoreObjectConfig<O>>['validate'],
  modify: Required<StoreObjectConfig<O>>['modify'],
  object: Readonly<O>,
  action: 'get' | 'set',
  lsKey: string,
): O => {
  const error = new TypeError(
    action === 'get'
      ? `Validation failed while parsing ${lsKey} from localStorage`
      : `Validation failed while setting to ${lsKey} in localStorage`,
  )

  const valid = validateResult(validate(object, action), error)
  if (!valid[0]) throw valid[1]

  return modify(object, action)
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
 * const myPerson = storeObject<Person>(
 *   'myPerson',
 *   {
 *     name: 'Ellie',
 *     age: 17,
 *     minor: true,
 *   },
 *   {
 *     // If the person's age is 18 or greater, set minor to false.
 *     // Otherwise, set it to true.
 *     // This will affect values as they're being stored in localStorage
 *     // and retrieved from it
 *     modify(value) {
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
export function storeObject<
  O extends Record<string, any> = Record<string, any>,
>(lsKey: string, defaults: O, configuration: StoreObjectConfig<O> = {}): O {
  const {
    checkGets,
    checkDefaults,
    partial,
    set,
    get,
    validate,
    modify,
    parse,
    stringify,
  } = defaultStoreObjectConfig(configuration)

  /** Call validOrThrow with relevant parameters by default */
  const vot = (value: any, action: 'get' | 'set' = 'set') =>
    validOrThrow(validate, modify, value, action, lsKey)

  const checkParse = (value: string): O => {
    const parsed = parse(value)
    const valid = vot(parsed, 'get')
    return valid
  }

  const checkStringify = (value: any): string => stringify(vot(value))

  const filterWanted = (obj: Readonly<any>, defaultIfUndefined = true) => {
    let desiredObject = {} as Partial<O>

    // Only read existing values for desired keys
    ;(Object.keys(defaults) as Keys<O>[]).forEach(
      // Set to value found in localStorage if it exists, otherwise use provided default
      key =>
        (desiredObject[key] = defaultIfUndefined
          ? // Use default if defaultInDefined
            obj[key] ?? defaults[key]
          : // Use given value even if undefined
            obj[key]),
    )

    return desiredObject as O
  }

  let object = { ...defaults } as O

  // Update localStorage value or read existing values
  if (checkDefaults) {
    const value = get(lsKey)
    if (value === null) {
      set(lsKey, checkStringify(defaults))
    } else if (partial) {
      const current = parse(value)
      object = filterWanted(current)

      const validModified = vot(object)
      set(lsKey, stringify({ ...current, ...validModified }))
    } else {
      object = checkParse(value)
    }
  }

  /** Proxy handler for the main object */
  const proxyHandler: ProxyHandler<O> = {
    set(target, key: Keys<O>, value) {
      const setResult = Reflect.set(target, key, value)

      if (partial) {
        const validModified = vot(target)
        set(
          lsKey,
          stringify({
            ...parse(get(lsKey)!),
            ...validModified,
          }),
        )
      } else set(lsKey, checkStringify(target))

      return setResult
    },

    get(target, key: Keys<O>) {
      if (checkGets) {
        if (partial) {
          target[key] = vot(filterWanted(parse(get(lsKey)!), false), 'get')[key]
          vot(target, 'get')
        } else {
          target[key] = checkParse(get(lsKey)!)[key] ?? defaults[key]
        }

        if (shouldObjectProxy(target[key])) {
          // Return a Proxy to the object to catch sets
          return nestedProxyHandler(target, key, target[key], this.set!)
        }
      }

      return Reflect.get(target, key)
    },
  }

  return new Proxy(object, proxyHandler)
}

/**
 * Configuration for storeSeparate
 */
export interface StoreSeparateConfig<O extends Record<string, any>>
  extends CommonConfig {
  /**
   * An optional unique identifier. Prefixes all keys in localStorage
   * with this id (eg. stores `foo` in localStorage as `myid.foo` for `myid`)
   */
  id?: string
  /**
   * Whether or not to check localStorage when an object key is retrieved
   * @default true
   */
  checkGets?: boolean

  /**
   * Validate an object before setting it in localStorage or reading it.
   * Can confirm/deny if the object is valid, along with an optional error message if it is invalid
   *
   * @param value A partial version of the originally passed object,
   * **containing only the key being get/set**
   * @param key The key being get/set
   * @returns A boolean to confirm validity or false and optionally an Error instance to deny validity
   */
  validate?(
    value: Partial<O>,
    action: 'get' | 'set',
    key: Keys<O>,
  ): boolean | readonly [boolean] | readonly [false, Error]
  /**
   * Modify an object before setting it in localStorage or reading it.
   * Called after validate. Any valiation should be done in validate and not here
   *
   * @param value A partial version of the originally passed object,
   * **containing only the key being get/set**
   * @param key The key being get/set
   * @returns A potentially modified version of the object originally passed.
   * **Only the key used in the value param will be changed in localStorage**
   */
  modify?(value: Partial<O>, action: 'get' | 'set', key: Keys<O>): Partial<O>
}

const defaultStoreSeparateConfig = <O extends Record<string, any>>({
  id,
  checkGets,
  checkDefaults,
  set,
  get,
  validate,
  modify,
  parse,
  stringify,
}: StoreSeparateConfig<O>): Omit<Required<StoreSeparateConfig<O>>, 'id'> &
  Pick<StoreSeparateConfig<O>, 'id'> => ({
  id,
  validate: validate ?? (() => true),
  modify: modify ?? (value => value),
  ...commonDefaults({ checkGets, checkDefaults, set, get, parse, stringify }),
})

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
const validOrThrowSeparate = <O extends Record<string, any>>(
  validate: Required<StoreSeparateConfig<O>>['validate'],
  modify: Required<StoreSeparateConfig<O>>['modify'],
  object: Readonly<Partial<O>>,
  action: 'get' | 'set',
  key: Keys<O>,
): Partial<O> => {
  const error = new TypeError(
    action === 'get'
      ? `Validation failed while parsing ${key} from localStorage`
      : `Validation failed while setting to ${key} in localStorage`,
  )

  const valid = validateResult(validate(object, action, key), error)
  if (!valid[0]) throw valid[1]

  return modify(object, action, key)
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
 * // No validation
 * import { storeSeparate } from 'ls-proxy'
 *
 * const myObj = storeSeparate({
 *   foo: 'bar',
 *   abc: 123,
 *   numbers: [1, 2, 3],
 * })
 *
 * myObj.foo = 'baz' // Updates localStorage
 * console.log(myObj.foo) // Checks localStorage if checkGets is true
 * console.log(myObj.abc === localStorage.abc) // true
 * ```
 *
 * @example
 * ```typescript
 * // Validating that the key being set/get is correct
 * import { storeSeparate } from 'ls-proxy'
 *
 * const myObj = storeSeparate(
 *   {
 *     foo: 'bar',
 *     abc: 123,
 *   },
 *   {
 *     validate(value, action, key) {
 *       if (key !== 'foo' && key !== 'abc') return false
 *       return true
 *     },
 *   },
 * )
 * ```
 *
 * @example
 * ```typescript
 * // Using IDs to avoid conflicting names
 * import { storeSeparate } from 'ls-proxy'
 *
 * const obj1 = storeSeparate({ foo: 'bar' }, { id: 'obj1' })
 * const obj2 = storeSeparate({ foo: 123 }, { id: 'obj2' })
 *
 * console.log(obj1.foo) // bar
 * console.log(obj2.foo) // 123
 * console.log(localStorage['obj1.foo']) // "bar"
 * console.log(localStorage['obj2.foo']) // 123
 * ```
 *
 * @example
 * ```typescript
 * // Automatically change a key while being set/get
 * import { storeSeparate } from 'ls-proxy'
 *
 * const myObj = storeSeparate(
 *   { base64Value: 'foo' },
 *   {
 *     // Decode base64 on get
 *     get(key) {
 *       return window.btoa(localStorage.getItem(key)!)
 *     },
 *     // Encode base64 on set
 *     set(key, value) {
 *       localStorage.setItem(key, window.atob(value))
 *     },
 *   },
 * )
 *
 * myObj.base64Value = 'bar' // Encoded in localStorage
 * console.log(myObj.base64Value) // Logs 'bar', decoded from localStorage
 * ```
 */
export function storeSeparate<
  O extends Record<string, any> = Record<string, any>,
>(defaults: O, configuration: StoreSeparateConfig<O> = {}): O {
  const {
    id,
    checkGets,
    checkDefaults,
    set,
    get,
    validate,
    modify,
    parse,
    stringify,
  } = defaultStoreSeparateConfig(configuration)
  const object = { ...defaults } as O

  /** Call validOrThrow with relevant parameters by default */
  const vot = (key: Keys<O>, value: any, action: 'get' | 'set') =>
    validOrThrowSeparate(
      validate,
      modify,
      { [key]: value } as Partial<O>,
      action,
      key,
    )[key]!

  // Set defaults
  if (checkDefaults) {
    for (const [key, value] of Object.entries(defaults) as [Keys<O>, any][]) {
      const keyPrefix = addId(key, id)
      const lsValue = get(keyPrefix)
      if (lsValue === null) {
        set(keyPrefix, stringify(vot(key, value, 'set')))
      } else object[key] = vot(parse(lsValue), key, 'get')
    }
  }

  return new Proxy(object, {
    set(target, key: Keys<O>, value: any) {
      // Modify object
      const modified = vot(key, value, 'set')
      set(addId(key, id), stringify(modified))
      return Reflect.set(target, key, modified)
    },

    get(target, key: Keys<O>) {
      if (checkGets) {
        const valueUnparsed = get(addId(key, id))
        const value = valueUnparsed ? parse(valueUnparsed) : defaults[key]
        target[key] = vot(key, value, 'get')
      }

      if (shouldObjectProxy(target[key])) {
        // Return a Proxy to the object to catch sets
        return nestedProxyHandler(target, key, target[key], this.set! as any)
      }

      return Reflect.get(target, key)
    },
  })
}

const addId = (key: string, id: string | undefined) =>
  id ? `${id}.${key}` : key
