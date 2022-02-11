import { storeObject } from 'ls-proxy'

interface Person {
  name: string
  age: number
  minor: boolean
}

const myPerson = storeObject(
  'myPerson',
  {
    name: 'Ellie',
    age: 17,
    minor: true,
  } as Person,
  {
    // If the person's age is 18 or greater, set minor to false.
    // Otherwise, set it to true.
    // This will affect values as they're being stored in localStorage
    // and retrieved from it
    validate(value) {
      if (value.age >= 18) value.minor = false
      else value.minor = true
      return value
    },
  },
)

myPerson.age = 18
console.log(myPerson.minor) // false
myPerson.age = 16
console.log(myPerson.minor) // true
