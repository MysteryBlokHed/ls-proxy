# ls-proxy [![Build Badge]](https://gitlab.com/MysteryBlokHed/ls-proxy/-/pipelines) [![NPM Badge]](https://www.npmjs.com/package/ls-proxy) [![License Badge]](#license)

Wrapper around localStorage (**[and other stores](#custom-stores)**) to easily store JSON objects.

Supports:

- Storing any type that can be serialized
- Runtime valdiation (eg. type checking)
- Deeply nested objects
- Defining custom stores other than localStorage

## Why to use?

### For localStorage

If you want to store client-side data for your website, the way to do it is with localStorage.
However, there is at least one siginificant downside: you can only store strings in localStorage keys.

The best way to get around this is by storing a stringified JSON object in a key,
but doing this manually or having to call a function that does it for you any time you change an object would be annoying.

This library solves these problems using JS proxies.
It also has great IDE support thanks to it being written in TypeScript.
You can also use it with vanilla JS with the Webpacked file (`ls-proxy.user.js` or `ls-proxy.min.user.js`),
which is useful to test it in the browser, when not using a JS bundler, or while writing UserScripts.

Here's all it takes to store a stringifed JSON object in localStorage and automatically change it:

```typescript
import { storeObject } from 'ls-proxy'

const someInfo = storeObject(
  // The localStorage key to save data under
  'someInfo',
  // The object to store
  {
    aString: 'Hello, World!',
    aNumber: 123,
    aBoolean: true,
    aList: [1, '2', 3],
  },
)

someInfo.aNumber = 42 // Updates localStorage
console.log(someInfo.aList) // Reads from localStorage
```

The method above stores an entire serialized object in localStorage,
meaning the entire object has to be stringified/parsed whenever a single key
is affected. The method below stores each key individually instead:

```typescript
import { storeSeparate } from 'ls-proxy'

const someInfo = storeObject(
  // The object to store
  {
    aString: 'Hello, World!',
    aNumber: 123,
    aBoolean: true,
    aList: [1, '2', 3],
  },
  // Optional; prefixes the stored keys with this ID
  { id: 'someInfo' },
)

someInfo.aNumber = 42 // Updates localStorage
console.log(someInfo.aList) // Reads from localStorage
```

### For other stores

If you have any value stored in a store that requires some extra action to trigger an update,
then using ls-proxy to create a custom store is a good option.
One example of this is React (and many other frontend UI's) state, which has to be updated by calling
a `setState` function instead of just mutating the value returned.
When using `ls-proxy`, state will be updated even if deeply nested objects' keys are modified.

You can override the `get` and `set` methods to automatically set/retrieve values from your other store:

```typescript
import { storeSeparate } from 'ls-proxy'

const myObj = storeSeparate({ foo: 'bar' },
{
  get(key) {
    // Logic to get a key here
  }

  set(key, value) {
    // Logic to set a key here
  }

  // Important!!
  // If your store only accepts strings, then don't override this method
  // If it accepts other values such as objects, then override it as shown
  // This makes sure that the proxy created by ls-proxy isn't accidentally stored,
  // which could cause a lot of very painful-to-find bugs
  stringify(value) {
    if (typeof value == 'object') return JSON.parse(JSON.stringify(value))
    return value
  }
})
```

#### Making a resuable function

To make a function to construct these objects, it's a good idea to still let the user pass in config options.
You can copy the signature from `storeObject` or `storeSeparate` as long as it's credited as described
by the project's licenses.

Here's an example:

```typescript
import { storeSeparate, StoreSeparateOptions } from 'ls-proxy'

// The options for your store function
// This should extend the original function's options, omitting those that your function overrides
type Options<O extends Record<string, any>> = Omit<
  StoreSeparateOptions<O>,
  'get' | 'set'
>

function storeCustom<O extends Record<string, any>>(
  defaults: O,
  configuration: Options<O>,
): O {
  return storeSeparate(defaults, {
    ...configuration,
    get(key) {
      // Logic to get a key here
    },

    set(key, value) {
      // Logic to set a key here
    },
  })
}
```

## Documentation

Documentation for the main branch is hosted at <https://ls-proxy.adamts.me>.
Documentation can be built from a cloned repository by running `yarn doc`.

Examples are located in [`examples`](https://gitlab.com/MysteryBlokHed/ls-proxy/-/tree/main/examples).

## storeObject vs storeSeparate

`storeSeparate` will generally be faster than `storeObject`
since there's less data being serialized/deserialized with each get/set,
but there are still reasons to use `storeObject`.
For example, if you want to use `validate` and `modify` (see documentation for config options),
and you need the entire object for context.
This can be the case if you need another key's value to validate the object,
or if you want to modify multiple keys with a single set/get.

## Custom stores

Because of the customization offered in the options of `storeObject` and `storeSeparate`,
it's possible to define custom stores other than localStorage.

These can be made by overriding the `get` and `set` methods via the config options.
There are some custom stores already built in in the `factories` subfolder:

- React State (`ls-proxy/factories/react`)

See [For other stores](#for-other-stores) for a brief explanation about how to set one up.

## Use

### In a Node project

To use in a Node project, add ls-proxy as a dependency.

```sh
# npm
npm install ls-proxy

# yarn
yarn add ls-proxy
```

You can then import and use functions:

```javascript
import { storeObject } from 'ls-proxy'

const myObj = storeObject('myObj', {
  name: 'John',
  age: 21,
})

myObj.name = 'Joe'
myObj.age++
```

### In a normal UserScript

In a UserScript that isn't built with some build tool, you can `@require` the library:

```javascript
// @require     https://gitlab.com/MysteryBlokHed/ls-proxy/-/raw/main/ls-proxy.user.js
```

<!-- Make sure that this is true for your project -->

You can replace `main` with a specific release tag like `v0.1.0` to require a specific version:

```javascript
// @require     https://gitlab.com/MysteryBlokHed/ls-proxy/-/raw/v0.1.0/ls-proxy.user.js
```

Each release tag also has a minified version of the script available,
which can be used by changing the file extension to `.min.user.js`:

```javascript
// @require     https://gitlab.com/MysteryBlokHed/ls-proxy/-/raw/v0.1.0/ls-proxy.min.user.js
```

Functions are available on the global `LSProxy` object:

```javascript
const { storeObject } = LSProxy

const myObj = storeObject('myObj', {
  name: 'John',
  age: 21,
})

myObj.name = 'Joe'
myObj.age++
```

#### Type declarations

The types included with the npm package still work when the library is `@require`'d.
Just add the types as a dev dependency for a Node project or install them globally.
With the package installed, include the following reference line somewhere in your TypeScript source file:

```typescript
/// <reference types="ls-proxy" />
```

## Building

### Setup

Building this project requires Node.js and Yarn.
To install dependencies, run:

```sh
yarn install
```

### Build

To build the project, run:

```sh
yarn build
```

To automatically build when a source file is modified, run:

```sh
yarn dev
```

Built JS files and type declarations will be placed in the `lib/` directory,
and the UserScript will be placed in the root. The `package.json` file is configured
to publish files in the `lib/` directory to npm.

### Test

To test the project, run:

```sh
yarn test
```

This project uses Jest for tests.

## License

This project is licensed under either of

- Apache License, Version 2.0, ([LICENSE-APACHE](LICENSE-APACHE) or
  <http://www.apache.org/licenses/LICENSE-2.0>)
- MIT license ([LICENSE-MIT](LICENSE-MIT) or
  <http://opensource.org/licenses/MIT>)

at your option.

This project was created from [a template](https://gitlab.com/MysteryBlokHed/webpack-ts-userscript-library)
licensed under the MIT license
([LICENSE](https://gitlab.com/MysteryBlokHed/webpack-ts-userscript-library/-/blob/main/LICENSE)
or <http://opensource.org/licenses/MIT>).

[build badge]: https://img.shields.io/gitlab/pipeline-status/MysteryBlokHed/ls-proxy
[npm badge]: https://img.shields.io/npm/v/ls-proxy
[license badge]: https://img.shields.io/badge/license-MIT%20OR%20Apache--2.0-green
