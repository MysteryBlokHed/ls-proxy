"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeStateful = void 0;
const common_1 = require("./common");
/**
 * Store multiple separate values in state that are automatically updated
 * @param defaults The defaults values if they are undefined
 * @param useState React's `useState` function, passed as-is
 * @param configuration Config options
 * @template O The stored object
 *
 * @example
 * ```tsx
 * import { storeStateful } from 'ls-proxy/factories/react'
 * import { useState } from 'react'
 *
 * const MyComponent = () => {
 *   const state = storeStateful({ count: 0 }, useState)
 *
 *   // When this button is clicked, the count is incremented and state is updated automatically
 *   return <button onClick={() => state.count++}>{state.count}</button>
 * }
 * ```
 */
function storeStateful(defaults, useState, configuration = {}) {
    return (0, common_1.storeReactlikeState)(defaults, {
        setDefaults(defaults) {
            const current = {};
            const stateFunctions = {};
            // Iterate over keys of defaults object
            for (const key of Object.keys(defaults).sort()) {
                // Save current value and setState method in separate objects
                ;
                [current[key], stateFunctions[key]] = useState(defaults[key]);
            }
            return { current, stateFunctions };
        },
    }, configuration);
}
exports.storeStateful = storeStateful;
