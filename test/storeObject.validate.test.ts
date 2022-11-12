import { storeObject, StoreObjectConfig, Validations } from '../src'

afterEach(() => localStorage.clear())

describe('validation for storeObject', () => {
  it('gets called with proper action when getting and setting', () => {
    let lastAction: 'get' | 'set' = 'get'

    const validate = jest.fn<
      boolean,
      Parameters<Required<StoreObjectConfig<{}>>['validate']>
    >((_, action) => {
      lastAction = action
      return true
    })

    // Should be called at creation
    const myObj = storeObject('myObj', { foo: 'bar', count: 0 }, { validate })
    expect(validate).toHaveBeenCalled()
    expect(lastAction).toBe('set')

    // Should be called when setting
    myObj.foo = 'baz'
    expect(validate).toHaveBeenCalled()
    expect(lastAction).toBe('set')

    // Should be called while getting
    myObj.foo
    expect(validate).toHaveBeenCalled()
    expect(lastAction).toBe('get')
  })

  it('throws errors when invalid', () => {
    const myObj = storeObject(
      'myObj',
      { foo: 'bar' },
      // Fails if foo is set to 'baz'
      { validate: value => !(value.foo === 'baz') },
    )

    // Setting
    expect(() => (myObj.foo = 'abc')).not.toThrow()
    expect(() => (myObj.foo = 'baz')).toThrowError(TypeError)

    // Getting
    expect(() => myObj.foo).not.toThrow()
    localStorage.myObj = JSON.stringify({ foo: 'baz' })
    expect(() => myObj.foo).toThrowError(TypeError)
  })

  it('throws user-provided errors when provided', () => {
    class CustomError extends Error {}

    const myObj = storeObject(
      'myObj',
      { foo: 'bar' },
      // Fails with custom error if foo is set to 'baz'
      {
        validate: value =>
          value.foo === 'baz' ? [false, new CustomError('custom error')] : true,
      },
    )

    // Setting
    expect(() => (myObj.foo = 'abc')).not.toThrow()
    expect(() => (myObj.foo = 'baz')).toThrowError(CustomError)

    // Getting
    expect(() => myObj.foo).not.toThrow()
    localStorage.myObj = JSON.stringify({ foo: 'baz' })
    expect(() => myObj.foo).toThrowError(CustomError)
  })
})

describe('validations provided by ls-proxy', () => {
  it('keys validation works as intended', () => {
    const myObj = storeObject(
      'myObj',
      { foo: 'bar' },
      // Fails if any key other than foo exists
      { validate: value => Validations.keys(value, ['foo']) },
    )

    // Setting
    expect(() => (myObj.foo = 'baz')).not.toThrow()
    // @ts-ignore
    expect(() => (myObj.abc = 123)).toThrowError(TypeError)

    // Getting
    expect(() => myObj.foo).not.toThrow()
    localStorage.myObj = JSON.stringify({ foo: 'baz', abc: 123 })
    expect(() => myObj.foo).toThrowError(TypeError)
    // @ts-ignore
    expect(() => myObj.baz).toThrowError(TypeError)
  })

  it('types validation works as intended', () => {
    const myObj = storeObject(
      'myObj',
      { foo: 'bar' },
      // Fails if foo's type is not string
      { validate: value => Validations.types(value, { foo: 'string' }) },
    )

    // Setting
    expect(() => (myObj.foo = 'baz')).not.toThrow()
    // @ts-ignore
    expect(() => (myObj.foo = 123)).toThrowError(TypeError)

    // Getting
    expect(() => myObj.foo).not.toThrow()
    localStorage.myObj = JSON.stringify({ foo: 123 })
    expect(() => myObj.foo).toThrowError(TypeError)
  })
})
