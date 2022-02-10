# ls-proxy

Wrap localStorage to modify it by changing an object.

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
([LICENSE](https://gitlab.com/MysteryBlokHed/webpack-ts-userscript-library/-/blob/main/LICENSE)
or <http://opensource.org/licenses/MIT>).

This project was created from [a template](https://gitlab.com/MysteryBlokHed/webpack-ts-userscript-library)
licensed under the MIT license
([LICENSE](https://gitlab.com/MysteryBlokHed/webpack-ts-userscript-library/-/blob/main/LICENSE)
or <http://opensource.org/licenses/MIT>).
