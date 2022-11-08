import { storeSeparate, StoreSeparateConfig } from '..'
import { addId } from '../utils'
import type { Keys } from '../types'

/** A value that Greasemonkey can store */
export type Storeable = string | boolean | number
/** Signature for GM.getValue */
export type GetValue = (
  key: string,
  defaultValue?: Storeable,
) => Promise<Storeable | undefined>
/** Signature for GM.setValue */
export type SetValue = (key: string, value: Storeable) => Promise<void>

export type Options<O extends Record<string, any>> = Omit<
  StoreSeparateConfig<O>,
  'checkGets' | 'checkDefaults' | 'set' | 'get'
>

export function storeGM<O extends Record<string, any> = Record<string, any>>(
  defaults: O,
  getValue: GetValue,
  setValue: SetValue,
  configuration: Options<O> = {},
): Promise<O> {
  const id = configuration.id
  const parse = configuration.parse || JSON.parse

  const current: Partial<O> = {}
  const promises: Promise<void>[] = []

  for (const [key, value] of Object.entries(defaults) as [
    Keys<O>,
    O[keyof O],
  ][]) {
    const keyPrefix = addId(key, id)
    promises.push(
      getValue(keyPrefix).then(currentValue => {
        if (currentValue === undefined) {
          current[key] = value
        } else {
          current[key] = parse(currentValue as string)
        }
      }),
    )
  }

  return Promise.all(promises).then(() =>
    storeSeparate(current as O, {
      ...configuration,

      checkGets: false,
      checkDefaults: false,

      set(key, value: Storeable) {
        setValue(key, value)
      },

      get: () => null,
    }),
  )
}
