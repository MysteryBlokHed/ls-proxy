import { SetState, Options as BaseOptions } from './common';
/** Basic signature for createSignal function */
export declare type CreateSignal = <T>(value: T, options?: {
    equals?: boolean;
}) => [() => T, SetState<T>];
export { SetState } from './common';
export declare type Options<O extends Record<string, any>> = Omit<BaseOptions<O>, 'mutateProxiedObject'>;
/**
 * Store multiple separate values in state that are automatically updated
 * @param defaults The defaults values if they are undefined
 * @param createSignal Solid's `createSignal` function, passed as-is
 * @param configuration Config options
 * @template O The stored object
 *
 * @example
 * ```tsx
 * import { storeStateful } from 'ls-proxy/factories/solid'
 * import { createSignal } from 'solid-js'
 *
 * const MyComponent = () => {
 *   const state = storeStateful({ count: 0 }, createSignal)
 *
 *   // When this button is clicked, the count is incremented and state is updated automatically
 *   return <button onClick={() => state.count++}>{state.count}</button>
 * }
 * ```
 */
export declare function createSignalProxy<O extends Record<string, any> = Record<string, any>>(defaults: O, createSignal: CreateSignal, configuration?: Options<O>): O;
