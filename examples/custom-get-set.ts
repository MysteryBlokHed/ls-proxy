// Using custom methods to get/set values instead of localStorage
import { storeObject } from 'ls-proxy'

// Values will be stored here instead of in localStorage
const notLocalStorage: Record<string, string> = {}

const myObj = storeObject(
  'myObj',
  {
    foo: 'bar',
  },
  {
    // Intercept sets
    set(key, value) {
      console.log('Setting', key, 'to', value)
      notLocalStorage[key] = value
    },
    // Intercept gets
    get(key) {
      console.log('Getting', key)
      return notLocalStorage[key]
    },
  },
)

myObj.foo = 'baz'
console.log(notLocalStorage.myObj) // {"foo":"baz"}
