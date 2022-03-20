import { storeSeparate, StoreSeparateConfig } from '../lib'

afterEach(() => localStorage.clear())

describe('modification for storeSeparate', () => {
  it('gets called with proper action when setting and getting', () => {
    interface Stored {
      foo: string
      count: number
    }

    let lastAction: 'get' | 'set' = 'get'

    const modify = jest.fn<
      Partial<Stored>,
      Parameters<Required<StoreSeparateConfig<Stored>>['modify']>
    >((value, action) => {
      lastAction = action
      return value
    })

    // Should be called once for each value at creation
    const myObj = storeSeparate<Stored>({ foo: 'bar', count: 0 }, { modify })
    expect(modify).toHaveBeenCalledTimes(2)
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

  it('modifies sets', () => {
    const myObj = storeSeparate(
      { foo: 'bar' },
      {
        // Set fooIsBar based on value of foo
        modify(value, action, key) {
          if (action === 'set') value[key] += ' SET'
          return value
        },
      },
    )

    expect(myObj.foo).toBe('bar SET')
    myObj.foo = 'baz'
    expect(myObj.foo).toBe('baz SET')
    localStorage.foo = JSON.stringify('bar')
    expect(myObj.foo).toBe('bar')
  })

  it('modifies gets', () => {
    const myObj = storeSeparate(
      { foo: 'bar' },
      {
        // Set fooIsBar based on value of foo
        modify(value, action, key) {
          if (action === 'get') value[key] += ' GET'
          return value
        },
      },
    )

    expect(myObj.foo).toBe('bar GET')
    myObj.foo = 'baz'
    expect(myObj.foo).toBe('baz GET')
    localStorage.foo = JSON.stringify('bar')
    expect(myObj.foo).toBe('bar GET')
  })
})
