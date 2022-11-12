import { SetState, Options } from './common';
/** Basic signature for useState function */
export declare type UseState = <T>(value: T) => [T, SetState<T>];
export { Options, SetState } from './common';
/**
 * Store multiple separate values in state that are automatically updated
 * @param defaults The defaults values if they are undefined
 * @param useState React's `useState` function, passed as-is
 * @param configuration Config options
 * @template O The stored object
 *
 * @example
 * ```tsx
 * import { useStateProxy } from 'ls-proxy/factories/react'
 * import { useState } from 'react'
 *
 * const MyComponent = () => {
 *   const state = useStateProxy({ count: 0 }, useState)
 *
 *   // When this button is clicked, the count is incremented and state is updated automatically
 *   return <button onClick={() => state.count++}>{state.count}</button>
 * }
 * ```
 */
export declare function useStateProxy<O extends Record<string, any> = Record<string, any>>(defaults: O, useState: UseState, configuration?: Options<O>): O;
