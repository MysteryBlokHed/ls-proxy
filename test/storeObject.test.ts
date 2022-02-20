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

  it('properly writes nested objects', () => {
    const myObj = storeObject('myObj', { nested: { foo: 'bar' } })
    expect(localStorage.myObj).toBe(JSON.stringify({ nested: { foo: 'bar' } }))
    myObj.nested.foo = 'baz'
    expect(localStorage.myObj).toBe(JSON.stringify({ nested: { foo: 'baz' } }))
  })

  it('properly reads nested objects', () => {
    const myObj = storeObject('myObj', { nested: { foo: 'bar' } })
    localStorage.myObj = JSON.stringify({ nested: { foo: 'baz' } })
    expect(myObj.nested.foo).toBe('baz')
  })

  it('properly writes deeply nested objects', () => {
    const deeplyNested = {
      nested1: {
        nested2: {
          foo: 'bar',
        },
      },
    }
    const myObj = storeObject('myObj', deeplyNested)
    expect(localStorage.myObj).toBe(JSON.stringify(deeplyNested))
    myObj.nested1.nested2.foo = 'baz'
    expect(JSON.parse(localStorage.myObj).nested1?.nested2?.foo).toBe('baz')
  })

  it('properly reads deeply nested objects', () => {
    const deeplyNested = {
      nested1: {
        nested2: {
          foo: 'bar',
        },
      },
    }
    const myObj = storeObject('myObj', deeplyNested)

    const modified = { ...deeplyNested }
    modified.nested1.nested2.foo = 'baz'

    localStorage.myObj = JSON.stringify(modified)
    expect(myObj.nested1.nested2.foo).toBe('baz')
  })
})
