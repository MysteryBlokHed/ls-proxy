import { storeSeparate, StoreSeparateConfig } from '..'
import type { Keys } from '../types'

type SetState<T> = (value: T) => void
type UseState = <T>(value: T) => [T, SetState<T>]

function keyInObject<O extends Record<string, any>>(
  key: string,
  object: O,
): asserts key is Keys<O> {
  if (!(key in object)) {
    throw new TypeError(`${key} was not passed in defaults object`)
  }
}

export type Options<O extends Record<string, any>> = Omit<
  StoreSeparateConfig<O>,
  'checkGets' | 'checkDefaults' | 'parse' | 'set' | 'stringify'
>

/**
 * Store multiple separate values in state that are automatically updated
 * @param defaults The defaults values if they are undefined
 * @param useState React's `useState` function, passed as-is
 * @param configuration Config options
 * @template O The stored object
 *
 * @example
 * ```tsx
 * import { storeStateful } from 'ls-proxy/factories/react'
 * import { useState } from 'react'
 *
 * const MyComponent = () => {
 *   const state = storeStateful({ count: 0 }, useState)
 *
 *   // When this button is clicked, the count is incremented and state is upgraded
 *   // The button's contents are read from state
 *   return <button onClick={() => state.count++}>{state.count}</button>
 * }
 * ```
 */
export function storeStateful<
  O extends Record<string, any> = Record<string, any>,
>(defaults: O, useState: UseState, configuration: Options<O> = {}): O {
  /** Current values */
  const object: Record<string, O[Keys<O>]> = {}
  /** setState functions */
  const stateFunctions: Record<string, SetState<O[Keys<O>]>> = {}

  // Iterate over keys of defaults object
  for (const key of Object.keys(defaults).sort() as Array<Keys<O>>) {
    // Save current value and setState method in separate objects
    ;[object[key], stateFunctions[key]] = useState(defaults[key])
  }

  /** State proxy object */
  const state = storeSeparate(object as O, {
    ...configuration,

    checkGets: false,
    checkDefaults: false,

    // Call useState for relevant key on set
    set(key, value: O[Keys<O>]) {
      keyInObject(key, object as O)
      stateFunctions[key](value)
      object[key] = value
    },

    // Return current value from original object
    get(key) {
      return object[key]
    },

    // Don't parse anything since raw object is stored
    parse: value => value,
    // Stringify and reparse if it's an object to remove the proxy while storing
    // Fixes React not rerendering on array/object changes
    stringify(value) {
      if (typeof value === 'object') return JSON.parse(JSON.stringify(value))
      return value
    },
  })

  return state
}
