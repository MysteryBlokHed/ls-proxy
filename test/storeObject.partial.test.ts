import { storeObject, Validations } from '../lib'

afterEach(() => localStorage.clear())

describe('partial option for storeObject', () => {
  it('properly sets defaults', () => {
    expect(localStorage.length).toBe(0)
    const obj1 = storeObject('obj', { foo: 1 }, { partial: true })
    expect(localStorage.length).toBe(1)
    expect(localStorage.obj).toBe(JSON.stringify({ foo: 1 }))

    const obj2 = storeObject('obj', { bar: 2 }, { partial: true })
    expect(localStorage.length).toBe(1)

    const stored = JSON.parse(localStorage.obj)
    expect(stored.foo).toBe(1)
    expect(stored.bar).toBe(2)
  })

  it('properly reads existing values', () => {
    localStorage.obj = JSON.stringify({ foo: 10, bar: 20 })

    const obj1 = storeObject('obj', { foo: 1 }, { partial: true })
    const obj2 = storeObject('obj', { bar: 2 }, { partial: true })

    expect(obj1.foo).toBe(10)
    expect(obj2.bar).toBe(20)
  })

  it('has no excess keys passed to validation', () => {
    const obj1 = storeObject(
      'obj',
      { foo: 1 },
      {
        partial: true,
        // Validates that only the key 'foo' exists
        validate: value => Validations.keys(value, ['foo']),
      },
    )

    const obj2 = storeObject(
      'obj',
      { bar: 2 },
      {
        partial: true,
        // Validates that only the key 'bar' exists
        validate: value => Validations.keys(value, ['bar']),
      },
    )

    expect(() => obj1.foo).not.toThrow()
    expect(() => (obj1.foo = 2)).not.toThrow()
    // @ts-ignore
    expect(() => obj1.bar).toThrowError(TypeError)
    // @ts-ignore
    expect(() => (obj1.bar = 5)).toThrowError(TypeError)
    expect(obj2.bar).not.toBe(5)
  })
})
