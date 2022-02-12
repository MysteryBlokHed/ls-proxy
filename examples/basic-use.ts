import { storeObject } from 'ls-proxy'

const myObject = storeObject('myObject', {
  foo: 'bar',
  someNumber: 12,
})

myObject.foo = 'baz' // Updates localStorage
console.log(myObject.foo) // Reads localStorage
myObject.someNumber++ // Increments value in localStorage
