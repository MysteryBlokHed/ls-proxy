import { storeSeparate } from '../src'

afterEach(() => localStorage.clear())

describe('storeSeparate function', () => {
  it('adds keys to localStorage', () => {
    expect(localStorage.length).toBe(0)

    const myObj = storeSeparate({
      foo: 'abc',
      bar: 'xyz',
    })

    expect(localStorage.length).toBe(2)
    expect(localStorage.foo).toBeDefined()
    expect(localStorage.bar).toBeDefined()
    expect(localStorage.foo).toBe('"abc"')
    expect(localStorage.bar).toBe('"xyz"')
  })

  it('modifies values in localStorage', () => {
    const myObj = storeSeparate({
      foo: 'abc',
      bar: 'xyz',
    })
    myObj.foo = 'def'

    expect(myObj.foo).toBe('def')
    expect(localStorage.foo).toBe('"def"')
  })

  it('prefixes values with provided ids', () => {
    const myObj = storeSeparate(
      {
        foo: 'abc',
        bar: 'xyz',
      },
      { id: 'test' },
    )

    expect(localStorage.length).toBe(2)
    expect(localStorage.foo).toBeUndefined()
    expect(localStorage.bar).toBeUndefined()
    expect(localStorage['test.foo']).toBeDefined()
    expect(localStorage['test.bar']).toBeDefined()
  })

  it('properly retrieves values from localStorage', () => {
    const myObj = storeSeparate({
      foo: 'abc',
      bar: 'xyz',
    })

    localStorage.foo = '"def"'
    expect(myObj.foo).toBe('def')
  })
})
