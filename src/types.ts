/** Get the keys of an object as strings */
export type Keys<O extends Record<string, any>> = keyof O & string
