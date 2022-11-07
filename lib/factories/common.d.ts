import { StoreSeparateConfig } from '..';
import type { Keys } from '../types';
/** Basic signature for setState function */
export declare type SetState<T> = (value: T) => void;
/** An object that contains setState functions matching the types of the provided object */
export declare type SetStateFunctions<O extends Record<string, any>> = {
    [K in keyof O]: SetState<O[K]>;
};
/**
 * An object that contains getState functions matching the types of the provided object.
 * This is for libraries (eg. SolidJS) where the state has to be retrieved from a function
 * every time to work properly
 */
export declare type GetStateFunctions<O extends Record<string, any>> = {
    [K in keyof O]: () => O[K];
};
export declare function keyInObject<O extends Record<string, any>>(key: string, object: O): asserts key is Keys<O>;
export interface StoreReactlikeStateOptions<O extends Record<string, any>> {
    /**
     * Should handle getting defaults from the useState function
     * @param defaults The defaults values
     * @returns The current values of each key as well as their setState functions
     */
    setDefaults(defaults: Readonly<O>): {
        current: O;
        stateFunctions: SetStateFunctions<O>;
    };
}
export declare type Options<O extends Record<string, any>> = Omit<StoreSeparateConfig<O>, 'checkGets' | 'checkDefaults' | 'parse' | 'set' | 'stringify'>;
/**
 * @param defaults The defaults values if they are undefined
 */
export declare function storeReactlikeState<O extends Record<string, any>>(defaults: O, reactlikeOptions: StoreReactlikeStateOptions<O>, passedConfiguration: Options<O>, overrideConfiguration?: StoreSeparateConfig<O>): O;
