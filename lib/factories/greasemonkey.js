"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeGM = void 0;
const __1 = require("..");
const utils_1 = require("../utils");
function storeGM(defaults, getValue, setValue, configuration = {}) {
    const id = configuration.id;
    const parse = configuration.parse || JSON.parse;
    const current = {};
    const promises = [];
    for (const [key, value] of Object.entries(defaults)) {
        const keyPrefix = (0, utils_1.addId)(key, id);
        promises.push(getValue(keyPrefix).then(currentValue => {
            if (currentValue === undefined) {
                current[key] = value;
            }
            else {
                current[key] = parse(currentValue);
            }
        }));
    }
    return Promise.all(promises).then(() => (0, __1.storeSeparate)(current, Object.assign(Object.assign({}, configuration), { checkGets: false, checkDefaults: false, set(key, value) {
            setValue(key, value);
        }, get: () => null })));
}
exports.storeGM = storeGM;
