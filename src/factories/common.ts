import { storeSeparate, StoreSeparateConfig } from '..'
import type { Keys } from '../types'

/** Basic signature for setState function */
export type SetState<T> = (value: T) => void
/** An object that contains setState functions matching the types of the provided object */
export type SetStateFunctions<O extends Record<string, any>> = {
  [K in keyof O]: SetState<O[K]>
}

export function keyInObject<O extends Record<string, any>>(
  key: string,
  object: O,
): asserts key is Keys<O> {
  if (!(key in object)) {
    throw new TypeError(`${key} was not passed in defaults object`)
  }
}

export interface StoreReactlikeStateOptions<O extends Record<string, any>> {
  /**
   * Should handle getting defaults from the useState function
   * @param defaults The defaults values
   * @returns The current values of each key as well as their setState functions
   */
  setDefaults(defaults: Readonly<O>): {
    current: O
    stateFunctions: SetStateFunctions<O>
  }
}

export type Options<O extends Record<string, any>> = Omit<
  StoreSeparateConfig<O>,
  'checkGets' | 'checkDefaults' | 'parse' | 'set' | 'stringify'
>

/**
 * @param defaults The defaults values if they are undefined
 */
export function storeReactlikeState<O extends Record<string, any>>(
  defaults: O,
  reactlikeOptions: StoreReactlikeStateOptions<O>,
  passedConfiguration: Options<O>,
  overrideConfiguration: StoreSeparateConfig<O> = {},
) {
  const { current, stateFunctions } = reactlikeOptions.setDefaults(defaults)

  /** State proxy object */
  const state = storeSeparate(current, {
    ...passedConfiguration,

    checkGets: false,
    checkDefaults: false,

    // Call useState for relevant key on set
    set(key, value: O[Keys<O>]) {
      keyInObject(key, current)
      stateFunctions[key](value)
      current[key] = value
    },

    // Should never be called due to config
    get: () => null,

    // Don't parse anything since raw object is stored
    parse: value => value,
    // Stringify and reparse if it's an object to remove the proxy while storing
    // Fixes React not rerendering on array/object changes
    stringify(value) {
      if (typeof value === 'object') return JSON.parse(JSON.stringify(value))
      return value
    },

    ...overrideConfiguration,
  })

  return state
}
