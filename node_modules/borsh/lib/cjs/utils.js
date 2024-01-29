"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.validate_schema = exports.ErrorSchema = exports.expect_enum = exports.expect_same_size = exports.expect_bigint = exports.expect_type = exports.isArrayLike = void 0;
var types_js_1 = require("./types.js");
function isArrayLike(value) {
    // source: https://stackoverflow.com/questions/24048547/checking-if-an-object-is-array-like
    return (Array.isArray(value) ||
        (!!value &&
            typeof value === 'object' &&
            'length' in value &&
            typeof (value.length) === 'number' &&
            (value.length === 0 ||
                (value.length > 0 &&
                    (value.length - 1) in value))));
}
exports.isArrayLike = isArrayLike;
function expect_type(value, type, fieldPath) {
    if (typeof (value) !== type) {
        throw new Error("Expected ".concat(type, " not ").concat(typeof (value), "(").concat(value, ") at ").concat(fieldPath.join('.')));
    }
}
exports.expect_type = expect_type;
function expect_bigint(value, fieldPath) {
    var basicType = ['number', 'string', 'bigint', 'boolean'].includes(typeof (value));
    var strObject = typeof (value) === 'object' && value !== null && 'toString' in value;
    if (!basicType && !strObject) {
        throw new Error("Expected bigint, number, boolean or string not ".concat(typeof (value), "(").concat(value, ") at ").concat(fieldPath.join('.')));
    }
}
exports.expect_bigint = expect_bigint;
function expect_same_size(length, expected, fieldPath) {
    if (length !== expected) {
        throw new Error("Array length ".concat(length, " does not match schema length ").concat(expected, " at ").concat(fieldPath.join('.')));
    }
}
exports.expect_same_size = expect_same_size;
function expect_enum(value, fieldPath) {
    if (typeof (value) !== 'object' || value === null) {
        throw new Error("Expected object not ".concat(typeof (value), "(").concat(value, ") at ").concat(fieldPath.join('.')));
    }
}
exports.expect_enum = expect_enum;
// Validate Schema
var VALID_STRING_TYPES = types_js_1.integers.concat(['bool', 'string']);
var VALID_OBJECT_KEYS = ['option', 'enum', 'array', 'set', 'map', 'struct'];
var ErrorSchema = /** @class */ (function (_super) {
    __extends(ErrorSchema, _super);
    function ErrorSchema(schema, expected) {
        var message = "Invalid schema: ".concat(JSON.stringify(schema), " expected ").concat(expected);
        return _super.call(this, message) || this;
    }
    return ErrorSchema;
}(Error));
exports.ErrorSchema = ErrorSchema;
function validate_schema(schema) {
    if (typeof (schema) === 'string' && VALID_STRING_TYPES.includes(schema)) {
        return;
    }
    if (schema && typeof (schema) === 'object') {
        var keys = Object.keys(schema);
        if (keys.length === 1 && VALID_OBJECT_KEYS.includes(keys[0])) {
            var key = keys[0];
            if (key === 'option')
                return validate_schema(schema[key]);
            if (key === 'enum')
                return validate_enum_schema(schema[key]);
            if (key === 'array')
                return validate_array_schema(schema[key]);
            if (key === 'set')
                return validate_schema(schema[key]);
            if (key === 'map')
                return validate_map_schema(schema[key]);
            if (key === 'struct')
                return validate_struct_schema(schema[key]);
        }
    }
    throw new ErrorSchema(schema, VALID_OBJECT_KEYS.join(', ') + ' or ' + VALID_STRING_TYPES.join(', '));
}
exports.validate_schema = validate_schema;
function validate_enum_schema(schema) {
    if (!Array.isArray(schema))
        throw new ErrorSchema(schema, 'Array');
    for (var _i = 0, schema_1 = schema; _i < schema_1.length; _i++) {
        var sch = schema_1[_i];
        if (typeof sch !== 'object' || !('struct' in sch)) {
            throw new Error('Missing "struct" key in enum schema');
        }
        if (typeof sch.struct !== 'object' || Object.keys(sch.struct).length !== 1) {
            throw new Error('The "struct" in each enum must have a single key');
        }
        validate_schema({ struct: sch.struct });
    }
}
function validate_array_schema(schema) {
    if (typeof schema !== 'object')
        throw new ErrorSchema(schema, '{ type, len? }');
    if (schema.len && typeof schema.len !== 'number') {
        throw new Error("Invalid schema: ".concat(schema));
    }
    if ('type' in schema)
        return validate_schema(schema.type);
    throw new ErrorSchema(schema, '{ type, len? }');
}
function validate_map_schema(schema) {
    if (typeof schema === 'object' && 'key' in schema && 'value' in schema) {
        validate_schema(schema.key);
        validate_schema(schema.value);
    }
    else {
        throw new ErrorSchema(schema, '{ key, value }');
    }
}
function validate_struct_schema(schema) {
    if (typeof schema !== 'object')
        throw new ErrorSchema(schema, 'object');
    for (var key in schema) {
        validate_schema(schema[key]);
    }
}
