import type { Keys } from '../types'
import {
  SetState,
  SetStateFunctions,
  Options,
  storeReactlikeState,
} from './common'

/** Basic signature for useState function */
export type UseState = <T>(value: T) => [T, SetState<T>]

export { Options, SetState } from './common'

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
 *   // When this button is clicked, the count is incremented and state is updated automatically
 *   return <button onClick={() => state.count++}>{state.count}</button>
 * }
 * ```
 */
export function storeStateful<
  O extends Record<string, any> = Record<string, any>,
>(defaults: O, useState: UseState, configuration: Options<O> = {}): O {
  return storeReactlikeState(
    defaults,
    {
      setDefaults(defaults) {
        const current: Partial<O> = {}
        const stateFunctions: Partial<SetStateFunctions<O>> = {}

        // Iterate over keys of defaults object
        for (const key of Object.keys(defaults).sort() as Array<Keys<O>>) {
          // Save current value and setState method in separate objects
          ;[current[key], stateFunctions[key]] = useState(defaults[key])
        }

        return { current, stateFunctions } as any
      },
    },
    configuration,
  )
}
