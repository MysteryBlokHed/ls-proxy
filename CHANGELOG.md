# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 0.5.0

### Changed

- Completely changed the `storeSeparate` function
  to automatically serialize/deserialize keys in localStorage like `storeObject`
  - Values are automatically serialized/deserialized
  - Supports `validate`, `modify`, and other functions from `storeObject`
  - Supports deeply nested objects

## 0.4.0

### Added

- Added option to define get/set functions for storeObject
- Added JSDoc for functions' generic types

## 0.3.1

### Fixed

- Fixed arrays not updating localStorage values the way objects do

## 0.3.0

### Added

- Added support for deeply nested objects
- Added action parameter to storeObject's modify and validate functions to indicate whether an object
  is being set to or retrieved from localStorage

## 0.2.1

### Changed

- Changed license from MIT to dual-license MIT OR Apache-2.0

### Fixed

- Fixed outdated JSDoc for validate function

## 0.2.0

### Added

- Option to store multiple objects under the same localStorage key (see `partial` parameter for `StoreObjectConfig`
  or `different-keys-same-object.ts` in examples)
- Testing with Jest
- Default functions for common validation use cases (key validation and basic type checking).
  See `Validations` namespace

### Changed

- Move modification ability of `validate` to new function for `storeObject`
- Removed some unecessary generics from functions

## 0.1.0

### Added

- Function to automatically change a serialized object in localStorage when an object is modified (`storeObject`)
- Function to automatically change keys in localStorage when an object is modified (`storeSeparate`)
