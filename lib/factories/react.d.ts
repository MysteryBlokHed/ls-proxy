import { StoreSeparateConfig } from '..';
declare type SetState<T> = (value: T) => void;
declare type UseState = <T>(value: T) => [T, SetState<T>];
export declare type Options<O extends Record<string, any>> = Omit<StoreSeparateConfig<O>, 'checkGets' | 'checkDefaults' | 'parse' | 'set' | 'stringify'>;
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
export declare function storeStateful<O extends Record<string, any> = Record<string, any>>(defaults: O, useState: UseState, configuration?: Options<O>): O;
export {};
