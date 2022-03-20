// Only works with storeObject
// Using two objects to watch different keys on the same object in localStorage
import { storeObject } from 'ls-proxy'

const sameKey = 'sameKey'

const obj1 = storeObject(sameKey, { foo: 1 }, { partial: true })
const obj2 = storeObject(sameKey, { bar: 2 }, { partial: true })

console.log(obj1.foo) // 1
console.log(obj2.bar) // 2

// The only values on each object are the ones passed
console.log(Object.entries(obj1)) // [['foo', 1]]
console.log(Object.entries(obj2)) // [['bar', 2]]
