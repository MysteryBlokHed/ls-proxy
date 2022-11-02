import { StoreSeparateConfig } from '..';
declare type SetState<T> = (value: T) => void;
declare type UseState = <T>(value: T) => [T, SetState<T>];
export declare type Options<O extends Record<string, any>> = Omit<StoreSeparateConfig<O>, 'checkGets' | 'parse' | 'set' | 'stringify'>;
export declare function storeStateful<O extends Record<string, any> = Record<string, any>>(defaults: O, useState: UseState, configuration?: Options<O>): O;
export {};
