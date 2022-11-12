"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSignalProxy = void 0;
const common_1 = require("./common");
/**
 * Store multiple separate values in state that are automatically updated
 * @param defaults The defaults values if they are undefined
 * @param createSignal Solid's `createSignal` function, passed as-is
 * @param configuration Config options
 * @template O The stored object
 *
 * @example
 * ```tsx
 * import { createSignalProxy } from 'ls-proxy/factories/solid'
 * import { createSignal } from 'solid-js'
 *
 * const MyComponent = () => {
 *   const state = createSignalProxy({ count: 0 }, createSignal)
 *
 *   // When this button is clicked, the count is incremented and state is updated automatically
 *   return <button onClick={() => state.count++}>{state.count}</button>
 * }
 * ```
 */
function createSignalProxy(defaults, createSignal, configuration = {}) {
    const current = {};
    const stateFunctions = {};
    return (0, common_1.storeReactlikeState)(defaults, {
        setDefaults(defaults) {
            // Iterate over keys of defaults object
            for (const key of Object.keys(defaults).sort()) {
                // Save current value and setSignal method in separate objects
                // IMPORTANT: current[key] is SolidJS's function to get the current state.
                // The get function for ls-proxy must be overridden to actually check this every time
                ;
                [current[key], stateFunctions[key]] = createSignal(defaults[key], {
                    equals: false,
                });
            }
            return { current, stateFunctions };
        },
    }, configuration, {
        checkGets: true,
        // Stop ls-proxy from overwriting the stored methods
        mutateProxiedObject: false,
        // Overridden to stop it from overwriting the getSignal method
        set(key, value) {
            (0, common_1.keyInObject)(key, current);
            stateFunctions[key](value);
        },
        // Overridden to run the getSignal method on each get instead of returning it
        get(key) {
            (0, common_1.keyInObject)(key, current);
            const gotten = current[key]();
            return gotten;
        },
        // Overridden to make sure that functions aren't passed JSON.stringify
        stringify(value) {
            if (typeof value === 'function')
                return value;
            else if (typeof value === 'object')
                return JSON.parse(JSON.stringify(value));
            return value;
        },
    });
}
exports.createSignalProxy = createSignalProxy;
