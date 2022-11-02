import { storeStateful } from '../lib/factories/react'

// Simulated state
let stateIndex = 0
const state: unknown[] = []

const useState = <T>(val: T): [T, (val: T) => void] => {
  if (stateIndex in state) {
    state[stateIndex] = val
  } else {
    state.push(val)
  }

  let current = stateIndex
  stateIndex++

  return [state[current] as T, (val: T) => (state[current] = val)]
}

const resetState = () => {
  stateIndex = 0
  state.length = 0
}

afterEach(() => resetState())

describe('storeStateful factory for React state', () => {
  it('initializes correctly', () => {
    const stateObj = storeStateful({ foo: 'bar' }, useState)
    expect(stateObj.foo).toBe('bar')
  })

  it('sets state on initialization', () => {
    const stateObj = storeStateful({ foo: 'bar' }, useState)
    expect(state.length).toBe(1)
    expect(state[0]).toBe('bar')
  })

  it('sets state on key updates', () => {
    const stateObj = storeStateful({ foo: 'bar' }, useState)
    stateObj.foo = 'baz'
    expect(state.length).toBe(1)
    expect(state[0]).toBe('baz')
  })

  it('works with multiple keys', () => {
    const stateObj = storeStateful({ foo: 'abc', bar: 'def' }, useState)
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
    const stateObj = storeStateful({ obj: { foo: 'bar' } }, useState)
    expect(state.length).toBe(1)
    expect(state[0]).toEqual({ foo: 'bar' })
    stateObj.obj.foo = 'baz'
    expect(state.length).toBe(1)
    expect(state[0]).toEqual({ foo: 'baz' })
  })

  it('supports deeply nested objects', () => {
    const stateObj = storeStateful(
      { nested1: { nested2: { foo: 'bar' } } },
      useState,
    )
    expect(state.length).toBe(1)
    expect(state[0]).toEqual({ nested2: { foo: 'bar' } })
    stateObj.nested1.nested2.foo = 'baz'
    expect(state.length).toBe(1)
    expect(state[0]).toEqual({ nested2: { foo: 'baz' } })
  })
})
