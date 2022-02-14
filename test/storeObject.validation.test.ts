import { storeObject, Validations } from '../lib'

afterEach(() => localStorage.clear())

describe('validation for storeObject', () => {
  it('throws errors when invalid', () => {
    const myObj = storeObject(
      'myObj',
      { foo: 'bar' },
      // Fails if foo is set to 'baz'
      { validate: value => !(value.foo === 'baz') },
    )

    expect(() => (myObj.foo = 'abc')).not.toThrow()
    expect(() => (myObj.foo = 'baz')).toThrowError(TypeError)
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

    expect(() => (myObj.foo = 'abc')).not.toThrow()
    expect(() => (myObj.foo = 'baz')).toThrowError(CustomError)
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

    expect(() => (myObj.foo = 'baz')).not.toThrow()
    // @ts-ignore
    expect(() => (myObj.abc = 123)).toThrowError(TypeError)
  })

  it('types validation works as intended', () => {
    const myObj = storeObject(
      'myObj',
      { foo: 'bar' },
      // Fails if foo's type is not string
      { validate: value => Validations.types(value, { foo: 'string' }) },
    )

    expect(() => (myObj.foo = 'baz')).not.toThrow()
    // @ts-ignore
    expect(() => (myObj.foo = 123)).toThrowError(TypeError)
  })
})
