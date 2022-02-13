import { storeObject, Validations } from 'ls-proxy'

interface Person {
  name: string
  age: number
}
const personKeys = ['name', 'age']
const typesMap = {
  name: 'string',
  age: 'number',
}

const myObject = storeObject<Person>(
  'myObject',
  {
    name: 'Joe',
    age: 20,
  },
  {
    validate: value =>
      Validations.keys(value, personKeys) && Validations.types(value, typesMap),
  },
)

// No error
myObject.name = 'Marvin'
myObject.age = 42

// Runtime error due to invalid type
myObject.name = 123
// Runtime error due to unknown key
myObject.abc = true
