# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

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
