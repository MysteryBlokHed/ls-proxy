"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** Validations meant to be used with `storeObject`'s validate function */
var Validations;
(function (Validations) {
    /**
     * Validate that only expected keys are present on an object
     *
     * @param value The unknown value to validate types of
     * @param requiredKeys The **only** keys that should be present
     * @template O The stored object
     *
     * @example
     * ```typescript
     * import { storeObject, Validations } from 'ls-proxy'
     *
     * const myObj = storeObject(
     *   'myObj',
     *   { foo: 'bar' },
     *   { validate: value => Validations.keys(value, ['foo']) },
     * )
     *
     * myObj.foo = 'abc' // no error
     * myObj.bar = 'xyz' // error
     * ```
     */
    Validations.keys = (value, requiredKeys) => Object.keys(value).every(key => requiredKeys.includes(key)) &&
        requiredKeys.every(key => key in value);
    /**
     * Validate that the types passed for an object are expected
     *
     * @param value The unknown value to validate types of
     * @param typesMap A map of expected keys for an object to expected types, checked like `typeof value[key] === typesMap[key]`
     * @template O The stored object
     * @example
     * ```typescript
     * import { storeObject, Validations } from 'ls-proxy'
     *
     * const typesMap = {
     *   onlyString: 'string',
     *   onlyNumber: 'number',
     * }
     *
     * const runtimeCheckedTypes = storeObject(
     *   'runtimeCheckedTypes',
     *   {
     *     onlyString: 'abc',
     *     onlyNumber: 123,
     *   },
     *   { validate: value => Validations.types(value, typesMap) },
     * )
     *
     * runtimeCheckedTypes.onlyString = 'xyz' // Succeeds
     * runtimeCheckedTypes.onlyNumber = 'abc' // Fails
     * ```
     */
    Validations.types = (value, typesMap) => Object.entries(value).every(([key, value]) => typeof value === typesMap[key]);
})(Validations || (Validations = {}));
exports.default = Validations;
