import { StoreSeparateConfig } from '..';
/** A value that Greasemonkey can store */
export declare type Storeable = string | boolean | number;
/** Signature for GM.getValue */
export declare type GetValue = (key: string, defaultValue?: Storeable) => Promise<Storeable | undefined>;
/** Signature for GM.setValue */
export declare type SetValue = (key: string, value: Storeable) => Promise<void>;
export declare type Options<O extends Record<string, any>> = Omit<StoreSeparateConfig<O>, 'checkGets' | 'checkDefaults' | 'set' | 'get'>;
export declare function storeGM<O extends Record<string, any> = Record<string, any>>(defaults: O, getValue: GetValue, setValue: SetValue, configuration?: Options<O>): Promise<O>;
