import type { Keys } from '../types'
import {
  SetState,
  SetStateFunctions,
  GetStateFunctions,
  Options as BaseOptions,
  keyInObject,
  storeReactlikeState,
} from './common'

/** Basic signature for createSignal function */
export type CreateSignal = <T>(
  value: T,
  options?: { equals?: boolean },
) => [() => T, SetState<T>]

export { SetState } from './common'

export type Options<O extends Record<string, any>> = Omit<
  BaseOptions<O>,
  'mutateProxiedObject'
>

/**
 * Store multiple separate values in state that are automatically updated
 * @param defaults The defaults values if they are undefined
 * @param createSignal Solid's `createSignal` function, passed as-is
 * @param configuration Config options
 * @template O The stored object
 *
 * @example
 * ```tsx
 * import { createSignalProxy } from 'ls-proxy/factories/solid'
 * import { createSignal } from 'solid-js'
 *
 * const MyComponent = () => {
 *   const state = createSignalProxy({ count: 0 }, createSignal)
 *
 *   // When this button is clicked, the count is incremented and state is updated automatically
 *   return <button onClick={() => state.count++}>{state.count}</button>
 * }
 * ```
 */
export function createSignalProxy<
  O extends Record<string, any> = Record<string, any>,
>(defaults: O, createSignal: CreateSignal, configuration: Options<O> = {}): O {
  const current: Partial<GetStateFunctions<O>> = {}
  const stateFunctions: Partial<SetStateFunctions<O>> = {}

  return storeReactlikeState(
    defaults,
    {
      setDefaults(defaults) {
        // Iterate over keys of defaults object
        for (const key of Object.keys(defaults).sort() as Array<Keys<O>>) {
          // Save current value and setSignal method in separate objects
          // IMPORTANT: current[key] is SolidJS's function to get the current state.
          // The get function for ls-proxy must be overridden to actually check this every time
          ;[current[key], stateFunctions[key]] = createSignal(defaults[key], {
            equals: false,
          })
        }

        return { current, stateFunctions } as any
      },
    },
    configuration,
    {
      checkGets: true,
      // Stop ls-proxy from overwriting the stored methods
      mutateProxiedObject: false,

      // Overridden to stop it from overwriting the getSignal method
      set(key, value: O[Keys<O>]) {
        keyInObject(key, current)
        stateFunctions[key]!(value)
      },

      // Overridden to run the getSignal method on each get instead of returning it
      get(key) {
        keyInObject(key, current)
        const gotten = current[key]!()
        return gotten
      },

      // Overridden to make sure that functions aren't passed JSON.stringify
      stringify(value) {
        if (typeof value === 'function') return value
        else if (typeof value === 'object')
          return JSON.parse(JSON.stringify(value))
        return value
      },
    },
  )
}
