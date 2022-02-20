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

  it('properly writes nested objects and arrays', () => {
    const myObj = storeObject('myObj', {
      nested: { foo: 'bar', arr: [1] },
    })

    // Object
    expect(JSON.parse(localStorage.myObj).nested.foo).toBe('bar')
    myObj.nested.foo = 'baz'
    expect(JSON.parse(localStorage.myObj).nested.foo).toBe('baz')

    // Array
    expect(JSON.parse(localStorage.myObj).nested.arr[0]).toBe(1)
    myObj.nested.arr[0] = 2
    expect(JSON.parse(localStorage.myObj).nested.arr[0]).toBe(2)
  })

  it('properly reads nested objects and arrays', () => {
    const myObj = storeObject('myObj', { nested: { foo: 'bar', arr: [1] } })

    // Object
    localStorage.myObj = JSON.stringify({ nested: { foo: 'baz', arr: [1] } })
    expect(myObj.nested.foo).toBe('baz')

    // Array
    localStorage.myObj = JSON.stringify({ nested: { foo: 'baz', arr: [2] } })
    expect(myObj.nested.arr[0]).toBe(2)
  })

  it('properly writes deeply nested objects and arrays', () => {
    const deeplyNested = {
      nested1: {
        nested2: {
          foo: 'bar',
          arr: [1],
        },
      },
    }
    const myObj = storeObject('myObj', deeplyNested)

    // Object
    expect(localStorage.myObj).toBe(JSON.stringify(deeplyNested))
    myObj.nested1.nested2.foo = 'baz'
    expect(JSON.parse(localStorage.myObj).nested1.nested2.foo).toBe('baz')

    // Array
    myObj.nested1.nested2.arr[0] = 2
    expect(JSON.parse(localStorage.myObj).nested1.nested2.arr[0]).toBe(2)
  })

  it('properly reads deeply nested objects and arrays', () => {
    const deeplyNested = {
      nested1: {
        nested2: {
          foo: 'bar',
          arr: [1],
        },
      },
    }
    const myObj = storeObject('myObj', deeplyNested)

    const modified = { ...deeplyNested }
    modified.nested1.nested2.foo = 'baz'

    // Object
    localStorage.myObj = JSON.stringify(modified)
    expect(myObj.nested1.nested2.foo).toBe('baz')

    // Array
    modified.nested1.nested2.arr[0] = 2
    localStorage.myObj = JSON.stringify(modified)
    expect(myObj.nested1.nested2.arr[0]).toBe(2)
  })
})
