import { storeObject } from 'ls-proxy'

interface Person {
  name: string
  age: number
}
const personKeys = ['name', 'age']

/** Validate that an entry is a Person */
const validate = (value: any): boolean => {
  // Check that the only keys on the passed object are keys of Person
  if (!Object.keys(value).every(key => personKeys.includes(key))) return false
  // Check that keys are of the correct types
  if (typeof value.name !== 'string') return false
  if (typeof value.age !== 'number') return false
  return true
}

const myObject = storeObject(
  'myObject',
  {
    people: [
      {
        name: 'John',
        age: 21,
      },
      {
        name: 'Marvin',
        age: 42,
      },
    ] as Person[],
  },
  { validate },
)

// No error
myObject.people[0].name = 'Joe'
myObject.people[0].age = 20

// Causes TypeScript error and throws error at runtime
myObject.people[1].name = 42
