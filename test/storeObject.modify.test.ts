import { storeObject, StoreObjectConfig } from '../lib'

afterEach(() => localStorage.clear())

describe('modification for storeObject', () => {
  it('gets called with proper action when setting and getting', () => {
    interface Stored {
      foo: string
      count: number
    }

    let lastAction: 'get' | 'set' = 'get'

    const modify = jest.fn<
      Stored,
      Parameters<Required<StoreObjectConfig<Stored>>['modify']>
    >((value, action) => {
      lastAction = action
      return value
    })

    // Should be called at creation
    const myObj = storeObject<Stored>(
      'myObj',
      { foo: 'bar', count: 0 },
      { modify },
    )
    expect(modify).toHaveBeenCalled()
    expect(lastAction).toBe('set')

    // Should be called when setting
    myObj.foo = 'baz'
    expect(modify).toHaveBeenCalled()
    expect(lastAction).toBe('set')

    // Should be called while getting
    myObj.foo
    expect(modify).toHaveBeenCalled()
    expect(lastAction).toBe('get')
  })

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
