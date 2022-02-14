import { storeObject } from '../lib'

afterEach(() => localStorage.clear())

describe('storeObject function', () => {
  it('adds key to localStorage', () => {
    expect(localStorage.length).toBe(0)
    const myObj = storeObject('myObj', { foo: 'bar' })
    expect(localStorage.length).toBe(1)
    expect(localStorage.myObj).toBeDefined()
  })

  it('stores itself serialized in localStorage', () => {
    const baseObj = { foo: 'bar' }
    const myObj = storeObject('myObj', { foo: 'bar' })
    expect(localStorage.myObj).toBe(JSON.stringify(baseObj))
  })

  it('modifies values in localStorage', () => {
    const myObj = storeObject('myObj', { foo: 'bar' })
    myObj.foo = 'baz'
    expect(localStorage.myObj).toBe(JSON.stringify({ foo: 'baz' }))
  })

  it('properly retrieves values from localStorage', () => {
    const myObj = storeObject('myObj', { foo: 'bar' })

    localStorage.myObj = JSON.stringify({ foo: 'baz' })
    expect(myObj.foo).toBe('baz')
  })
})
