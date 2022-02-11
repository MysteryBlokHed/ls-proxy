# ls-proxy [![Build Badge]](https://gitlab.com/MysteryBlokHed/ls-proxy/-/pipelines) [![NPM Badge]](https://www.npmjs.com/package/ls-proxy) [![License Badge]](#license)

Wrapper around localStorage to easily store JSON objects.

Supports:

- Storing any type that can be serialized
- Runtime type checking

## Documentation

Documentation for the main branch is hosted at <https://ls-proxy.adamts.me>.
Documentation can be built from a cloned repository by running `yarn doc`.

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

### Building files

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

## License

This project is licensed under the MIT license
([LICENSE](https://gitlab.com/MysteryBlokHed/ls-proxy/-/blob/main/LICENSE)
or <http://opensource.org/licenses/MIT>).

This project was created from [a template](https://gitlab.com/MysteryBlokHed/ls-proxy)
licensed under the MIT license
([LICENSE](https://gitlab.com/MysteryBlokHed/ls-proxy/-/blob/main/LICENSE)
or <http://opensource.org/licenses/MIT>).

[build badge]: https://img.shields.io/gitlab/pipeline-status/MysteryBlokHed/ls-proxy
[npm badge]: https://img.shields.io/npm/v/ls-proxy
[license badge]: https://img.shields.io/badge/license-MIT-green
