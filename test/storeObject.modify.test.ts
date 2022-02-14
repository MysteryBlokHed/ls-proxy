import { storeObject } from '../lib'

afterEach(() => localStorage.clear())

describe('modification for storeObject', () => {
  it('modifies both sets and gets', () => {
    const myObj = storeObject(
      'myObj',
      { foo: 'bar', fooIsBar: true },
      {
        // Set fooIsBar based on value of foo
        modify(value) {
          if (value.foo === 'bar') {
            value.fooIsBar = true
          } else {
            value.fooIsBar = false
          }

          return value
        },
      },
    )

    // Setting
    expect(myObj.foo).toBe('bar')
    expect(myObj.fooIsBar).toBeTruthy()
    myObj.foo = 'baz'
    expect(myObj.fooIsBar).toBeFalsy()
    myObj.foo = 'bar'
    expect(myObj.fooIsBar).toBeTruthy()

    // Getting
    // Should be truthy due to modification of read from localStorage
    localStorage.myObj = JSON.stringify({ foo: 'bar', fooIsBar: false })
    expect(myObj.fooIsBar).toBeTruthy()
    // Similar deal here
    localStorage.myObj = JSON.stringify({ foo: 'baz', fooIsBar: true })
    expect(myObj.fooIsBar).toBeFalsy()
  })
})
