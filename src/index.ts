/** Configuration for storeObject */
export interface StoreObjectConfig {
  /**
   * Whether or not to check localStorage when an object key is retrieved
   * @default true
   */
  checkGets?: boolean
  /**
   * Validate an object before setting it in localStorage or reading it.
   * Should return true if an object is valid or false otherwise.
   * If the return is false, a TypeError will be thrown from the Proxy
   * @returns Either a boolean or false and an error to throw
   * @default () => true
   */
  validate?: (
    value: any,
  ) => boolean | readonly [boolean] | readonly [false, Error]
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

const defaultStoreObjectConfig = ({
  checkGets,
  validate,
  parse,
  stringify,
}: StoreObjectConfig): Required<StoreObjectConfig> => {
  return {
    checkGets: checkGets ?? true,
    validate: validate ?? (() => true),
    parse: parse ?? JSON.parse,
    stringify: stringify ?? JSON.stringify,
  }
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
export function storeObject<
  Keys extends string = string,
  Object extends Record<Keys, any> = Record<Keys, any>,
>(
  lsKey: string,
  defaults: Readonly<Object>,
  configuration: StoreObjectConfig = {},
): Object {
  const { checkGets, validate, parse, stringify } =
    defaultStoreObjectConfig(configuration)

  const checkParse = (value: string): Object => {
    const parsed = parse(value)
    const valid = validate(parsed)
    validOrThrow(valid, 'get', lsKey)
    return parsed
  }

  const checkStringify = (value: any): string => {
    const valid = validate(value)
    validOrThrow(valid, 'set', lsKey)
    return stringify(value)
  }

  let object = { ...defaults } as Object

  // Update localStorage value
  if (!localStorage[lsKey]) {
    localStorage[lsKey] = checkStringify(defaults)
  } else object = checkParse(localStorage[lsKey])

  return new Proxy(object, {
    set(target, key: Keys, value: string, receiver) {
      const setResult = Reflect.set(target, key, value, receiver)
      localStorage[lsKey] = checkStringify(target)

      return setResult
    },

    get(target, key: Keys, receiver) {
      if (checkGets)
        target[key] = checkParse(localStorage[lsKey])[key] ?? defaults[key]

      return Reflect.get(target, key, receiver)
    },
  })
}

const validOrThrow = (
  valid: ReturnType<Required<StoreObjectConfig>['validate']>,
  action: 'get' | 'set',
  lsKey: string,
) => {
  const error = new TypeError(
    action === 'get'
      ? `Validation failed while parsing ${lsKey} from localStorage`
      : `Validation failed while setting to ${lsKey} in localStorage`,
  )

  // Throw error on failure
  if (typeof valid === 'boolean') {
    if (!valid) throw error
  } else if (!valid[0]) {
    if (valid.length === 2) throw valid[1]
    else throw error
  }
}

/** Configuration for storeSeparate */
export interface StoreSeparateConfig {
  /**
   * An optional unique identifier. Prefixes all keys in localStorage
   * with this id (eg. stores `foo` in localStorage as `myid.foo` for `myid`)
   */
  id?: string
  /**
   * Whether or not to set the defaults in localStorage if they are not defined
   * @default false
   */
  setDefaults?: boolean
  /**
   * Whether or not to check localStorage when an object key is retrieved
   * @default true
   */
  checkGets?: boolean
}

const defaultStoreSeparateConfig = ({
  id,
  setDefaults,
  checkGets,
}: StoreSeparateConfig): Omit<Required<StoreSeparateConfig>, 'id'> &
  Pick<StoreSeparateConfig, 'id'> => {
  return {
    id,
    setDefaults: setDefaults ?? false,
    checkGets: checkGets ?? true,
  }
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
export function storeSeparate<
  Keys extends string = string,
  Object extends Record<Keys, string> = Record<Keys, string>,
>(defaults: Readonly<Object>, configuration: StoreSeparateConfig = {}): Object {
  const { id, setDefaults, checkGets } =
    defaultStoreSeparateConfig(configuration)
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

const addId = (key: string, id: string | undefined) =>
  id ? `${id}.${key}` : key
