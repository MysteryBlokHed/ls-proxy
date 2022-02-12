type Keys<O extends Record<string, any>> = keyof O & string

/** Configuration for storeObject */
export interface StoreObjectConfig<O extends Record<string, any>> {
  /**
   * Whether or not to check localStorage when an object key is retrieved
   * @default true
   */
  checkGets?: boolean
  /**
   * Validate an object before setting it in localStorage or reading it.
   * Can confirm/deny if the object is valid, along with an optional error message if it is not
   *
   * @returns A boolean to confirm validity, false and an Error instance to deny validity,
   * or return true alongside an object to pass on instead of the original
   * @default () => true
   */
  validate?(
    value: Readonly<any>,
  ): boolean | readonly [boolean] | readonly [false, Error]
  /**
   * Modify an object before setting it in localStorage or reading it.
   * Called after validate. Any valiation should be done in validate and not here
   *
   * @returns A boolean to confirm validity, false and an Error instance to deny validity,
   * or return true alongside an object to pass on instead of the original
   */
  modify?(value: O): O
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
export const keyValidation = <O extends Record<string, any>>(
  value: any,
  requiredKeys: readonly string[],
): ReturnType<Required<StoreObjectConfig<O>>['validate']> =>
  Object.keys(value).every(key => requiredKeys.includes(key)) &&
  requiredKeys.every(key => key in value)

const defaultStoreObjectConfig = <O extends Record<string, any>>({
  checkGets,
  validate,
  modify,
  parse,
  stringify,
}: StoreObjectConfig<O>): Required<StoreObjectConfig<O>> => {
  return {
    checkGets: checkGets ?? true,
    validate: validate ?? (() => true),
    modify: modify ?? (value => value),
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
 * })
 *
 * myPerson.name = 'Joe' // Updates localStorage
 * console.log(myPerson.name) // Checks localStorage if checkGets is true
 * ```
 *
 * @example
 * ```typescript
 * // Validating that the expected keys exist and are the correct type
 * import { storeObject, keyValidation } from 'ls-proxy'
 *
 * const myObj = storeObject(
 *   'myObj',
 *   {
 *     someString: 'string',
 *     someNumber: 42,
 *   },
 *   {
 *     validate(value) {
 *       if (!keyValidation(value, ['someString', 'someNumber'])) return false
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
export function storeObject<
  O extends Record<string, any> = Record<string, any>,
>(
  lsKey: string,
  defaults: Readonly<O>,
  configuration: StoreObjectConfig<O> = {},
): O {
  const { checkGets, validate, modify, parse, stringify } =
    defaultStoreObjectConfig(configuration)

  const checkParse = (value: string): O => {
    const parsed = parse(value)
    const valid = validOrThrow(validate, modify, parsed, 'get', lsKey)
    return valid
  }

  const checkStringify = (value: any): string =>
    stringify(validOrThrow(validate, modify, value, 'set', lsKey))

  let object = { ...defaults } as O

  // Update localStorage value
  if (!localStorage[lsKey]) {
    localStorage[lsKey] = checkStringify(defaults)
  } else object = checkParse(localStorage[lsKey])

  return new Proxy(object, {
    set(target, key: Keys<O>, value: string, receiver) {
      const setResult = Reflect.set(target, key, value, receiver)
      localStorage[lsKey] = checkStringify(target)

      return setResult
    },

    get(target, key: Keys<O>, receiver) {
      if (checkGets)
        target[key] = checkParse(localStorage[lsKey])[key] ?? defaults[key]

      return Reflect.get(target, key, receiver)
    },
  })
}

/**
 * Validate and modify an object
 *
 * @param validate Return from the validate function
 * @param modify Function to modify the object
 * @param object The object to modify
 * @param action Whether the object is being get or set
 * @param lsKey The key in localStorage
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

  const valid = validate(object)

  // Throw error on failure
  if (typeof valid === 'boolean') {
    // Return is bool
    if (!valid) throw error
  } else if (Array.isArray(valid)) {
    // Return is array
    if (!valid[0]) {
      if (valid.length === 2) throw valid[1]
      else throw error
    }
  }

  return modify(object)
}

/** Configuration for storeSeparate */
export interface StoreSeparateConfig {
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
}

const defaultStoreSeparateConfig = ({
  id,
  checkGets,
}: StoreSeparateConfig): Omit<Required<StoreSeparateConfig>, 'id'> &
  Pick<StoreSeparateConfig, 'id'> => {
  return {
    id,
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
  O extends Record<string, string> = Record<string, string>,
>(defaults: Readonly<O>, configuration: StoreSeparateConfig = {}): O {
  const { id, checkGets } = defaultStoreSeparateConfig(configuration)
  const object = { ...defaults } as O

  // Set defaults
  for (const [key, value] of Object.entries(defaults) as [Keys<O>, string][]) {
    const keyPrefix = addId(key, id)
    if (!localStorage[keyPrefix]) localStorage[keyPrefix] = value
    else object[key] = localStorage[keyPrefix]
  }

  return new Proxy(object, {
    set(target, key: Keys<O>, value: string, receiver) {
      localStorage[addId(key, id)] = value
      return Reflect.set(target, key, value, receiver)
    },

    get(target, key: Keys<O>, receiver) {
      if (checkGets) target[key] = localStorage[addId(key, id)] ?? defaults[key]
      return Reflect.get(target, key, receiver)
    },
  })
}

const addId = (key: string, id: string | undefined) =>
  id ? `${id}.${key}` : key
