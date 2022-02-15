# ls-proxy [![Build Badge]](https://gitlab.com/MysteryBlokHed/ls-proxy/-/pipelines) [![NPM Badge]](https://www.npmjs.com/package/ls-proxy) [![License Badge]](#license)

Wrapper around localStorage to easily store JSON objects.

Supports:

- Storing any type that can be serialized
- Runtime type checking

## Why to use?

If you want to store client-side data for your website, the way to do it is with localStorage.
However, there is at least one siginificant downside: you can only store strings in localStorage keys.

The best way to get around this is by storing a stringified JSON object in a key,
but doing this manually or having to call a function that does it for you any time you change an object would be annoying.

This library solves these problems using JS proxies.
It also has great IDE support thanks to it being written in TypeScript.
You can also use it with vanilla JS with the Webpacked file (`ls-proxy.user.js`),
which is useful to test it in the browser or while writing UserScripts.

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

## Documentation

Documentation for the main branch is hosted at <https://ls-proxy.adamts.me>.
Documentation can be built from a cloned repository by running `yarn doc`.

Examples are located in [`examples`](https://gitlab.com/MysteryBlokHed/ls-proxy/-/tree/main/examples).

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

This project was created from [a template](https://gitlab.com/MysteryBlokHed/ls-proxy)
licensed under the MIT license
([LICENSE](https://gitlab.com/MysteryBlokHed/ls-proxy/-/blob/main/LICENSE)
or <http://opensource.org/licenses/MIT>).

[build badge]: https://img.shields.io/gitlab/pipeline-status/MysteryBlokHed/ls-proxy
[npm badge]: https://img.shields.io/npm/v/ls-proxy
[license badge]: https://img.shields.io/badge/license-MIT%20OR%20Apache--2.0-green
