"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addId = void 0;
const addId = (key, id) => id ? `${id}.${key}` : key;
exports.addId = addId;
