# webpack-ts-userscript-library

A template to create UserScript libraries using TypeScript and Webpack.

<!-- Info on how to use the template -->

## Difference between this and the original template

### Use case

This template should only be used if you're making a library for other UserScript developers.
Its Webpacked `.user.js` file adds exported members to a global object, letting them be used like this:

```typescript
// Use the exported hello function from the library
const { hello } = LibraryName
hello()
```

The template is also configured to be easily published to npm for developers that don't want to `@require` the library.

### Documentation

Documentation is generated with TypeDoc.
On GitLab repositories, the latest documentation is automatically built and hosted on GitLab Pages.

## Customizing the template

### Changing UserScript info

The UserScript's name, description, version, and author are all retrieved from the project's `package.json`.
Anything else such as the site to match and the grants are changed from the [Webpack Config].

There's a call to `genBanner` that can be used to change the values added to the banner.
To add a single value, add a string key and value. To add multiple values for
the same key (eg. multiple `@match`'s), use an array as the value.

Example:

```javascript
const banner = genBanner({
  name: 'my-userscript',
  version: '0.1.0',
  match: ['*://example.com/*', 'https://*.foo.com/bar*'],
})

/* Above example becomes: */
// ==UserScript==
// @name        my-userscript
// @version     0.1.0
// @match       *://example.com/*
// @match       https://*.foo.com/bar*
// ==/UserScript==
```

### Creating a release commit

To create a commit for a release version, run `yarn release`.
This will re-build the UserScript in production mode, add all files with `git add .`,
and prompt you to add a version to the commit message.
You can then create a new tag and release for your project with an optimized UserScript.

<!-- These instructions can be updated to fit your project's requirements -->

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

This project was created from [a template](https://gitlab.com/MysteryBlokHed/webpack-ts-userscript-library)
licensed under the MIT license
([LICENSE](https://gitlab.com/MysteryBlokHed/webpack-ts-userscript-library/-/blob/main/LICENSE)
or <http://opensource.org/licenses/MIT>).

[webpack config]: webpack.config.js
