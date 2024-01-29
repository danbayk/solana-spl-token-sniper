"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
exports.__esModule = true;
exports.deserialize = exports.serialize = void 0;
var serialize_js_1 = require("./serialize.js");
var deserialize_js_1 = require("./deserialize.js");
var utils = __importStar(require("./utils.js"));
function serialize(schema, value, validate) {
    if (validate === void 0) { validate = true; }
    if (validate)
        utils.validate_schema(schema);
    var serializer = new serialize_js_1.BorshSerializer(validate);
    return serializer.encode(value, schema);
}
exports.serialize = serialize;
function deserialize(schema, buffer, validate) {
    if (validate === void 0) { validate = true; }
    if (validate)
        utils.validate_schema(schema);
    var deserializer = new deserialize_js_1.BorshDeserializer(buffer);
    return deserializer.decode(schema);
}
exports.deserialize = deserialize;
