import { storeStateful } from '../lib/factories/solid'

// Simulated signals
// These all effectively have { equals: false } enabled
let stateIndex = 0
const state: unknown[] = []

const createSignal = <T>(
  val: T,
  options?: any,
): [() => T, (val: T) => void] => {
  if (stateIndex in state) {
    state[stateIndex] = val
  } else {
    state.push(val)
  }

  let current = stateIndex
  stateIndex++

  return [() => state[current] as T, (val: T) => (state[current] = val)]
}

const resetSignals = () => {
  stateIndex = 0
  state.length = 0
}

afterEach(() => resetSignals())

describe('storeStateful factory for SolidJS signals', () => {
  it('initializes correctly', () => {
    const stateObj = storeStateful({ foo: 'bar' }, createSignal)
    expect(stateObj.foo).toBe('bar')
  })

  it('sets state on initialization', () => {
    const stateObj = storeStateful({ foo: 'bar' }, createSignal)
    expect(state.length).toBe(1)
    expect(state[0]).toBe('bar')
  })

  it('sets state on key updates', () => {
    const stateObj = storeStateful({ foo: 'bar' }, createSignal)
    stateObj.foo = 'baz'
    expect(state.length).toBe(1)
    expect(state[0]).toBe('baz')
  })

  it('works with multiple keys', () => {
    const stateObj = storeStateful({ foo: 'abc', bar: 'def' }, createSignal)
    expect(stateObj.foo).toBe('abc')
    expect(stateObj.bar).toBe('def')
    expect(state.length).toBe(2)
    // Keys are sorted alphabetically, so bar is stored before foo
    expect(state[1]).toBe('abc')
    expect(state[0]).toBe('def')

    stateObj.foo = 'xyz'
    expect(state.length).toBe(2)
    expect(state[1]).toBe('xyz')
    expect(state[0]).toBe('def')
  })

  it('supports objects', () => {
    const stateObj = storeStateful({ obj: { foo: 'bar' } }, createSignal)
    expect(state.length).toBe(1)
    expect(state[0]).toEqual({ foo: 'bar' })
    stateObj.obj.foo = 'baz'
    expect(state.length).toBe(1)
    expect(state[0]).toEqual({ foo: 'baz' })
  })

  it('supports deeply nested objects', () => {
    const stateObj = storeStateful(
      { nested1: { nested2: { foo: 'bar' } } },
      createSignal,
    )
    expect(state.length).toBe(1)
    expect(state[0]).toEqual({ nested2: { foo: 'bar' } })
    stateObj.nested1.nested2.foo = 'baz'
    expect(state.length).toBe(1)
    expect(state[0]).toEqual({ nested2: { foo: 'baz' } })
  })
})
