import { storeSeparate, StoreSeparateConfig } from '../lib'

afterEach(() => localStorage.clear())

describe('validation for storeSeparate', () => {
  it('gets called with proper action when getting and setting', () => {
    let lastAction: 'get' | 'set' = 'get'

    interface Stored {
      foo: string
      count: number
    }

    const validate = jest.fn<
      boolean,
      Parameters<Required<StoreSeparateConfig<Stored>>['validate']>
    >((_, action) => {
      lastAction = action
      return true
    })

    // Should be called at creation
    const myObj = storeSeparate<Stored>({ foo: 'bar', count: 0 }, { validate })
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
    const myObj = storeSeparate(
      { foo: 'bar' },
      // Fails if foo is set to 'baz'
      { validate: value => !(value.foo === 'baz') },
    )

    // Setting
    expect(() => (myObj.foo = 'abc')).not.toThrow()
    expect(() => (myObj.foo = 'baz')).toThrowError(TypeError)

    // Getting
    expect(() => myObj.foo).not.toThrow()
    localStorage.foo = JSON.stringify('baz')
    expect(() => myObj.foo).toThrowError(TypeError)
  })

  it('throws user-provided errors when provided', () => {
    class CustomError extends Error {}

    const myObj = storeSeparate(
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
    localStorage.foo = JSON.stringify('baz')
    expect(() => myObj.foo).toThrowError(CustomError)
  })
})
