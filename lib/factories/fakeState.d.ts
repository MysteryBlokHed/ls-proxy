declare const state: unknown[];
declare let stateIndex: number;
declare const resetContext: () => number;
declare const useState: <T>(value: T) => (T | ((value: T) => T))[];
