import { integers } from './types.js';
import { EncodeBuffer } from './buffer.js';
import * as utils from './utils.js';
var BorshSerializer = /** @class */ (function () {
    function BorshSerializer(checkTypes) {
        this.encoded = new EncodeBuffer();
        this.fieldPath = ['value'];
        this.checkTypes = checkTypes;
    }
    BorshSerializer.prototype.encode = function (value, schema) {
        this.encode_value(value, schema);
        return this.encoded.get_used_buffer();
    };
    BorshSerializer.prototype.encode_value = function (value, schema) {
        if (typeof schema === 'string') {
            if (integers.includes(schema))
                return this.encode_integer(value, schema);
            if (schema === 'string')
                return this.encode_string(value);
            if (schema === 'bool')
                return this.encode_boolean(value);
        }
        if (typeof schema === 'object') {
            if ('option' in schema)
                return this.encode_option(value, schema);
            if ('enum' in schema)
                return this.encode_enum(value, schema);
            if ('array' in schema)
                return this.encode_array(value, schema);
            if ('set' in schema)
                return this.encode_set(value, schema);
            if ('map' in schema)
                return this.encode_map(value, schema);
            if ('struct' in schema)
                return this.encode_struct(value, schema);
        }
    };
    BorshSerializer.prototype.encode_integer = function (value, schema) {
        var size = parseInt(schema.substring(1));
        if (size <= 32 || schema == 'f64') {
            this.checkTypes && utils.expect_type(value, 'number', this.fieldPath);
            this.encoded.store_value(value, schema);
        }
        else {
            this.checkTypes && utils.expect_bigint(value, this.fieldPath);
            this.encode_bigint(BigInt(value), size);
        }
    };
    BorshSerializer.prototype.encode_bigint = function (value, size) {
        var buffer_len = size / 8;
        var buffer = new Uint8Array(buffer_len);
        for (var i = 0; i < buffer_len; i++) {
            buffer[i] = Number(value & BigInt(0xff));
            value = value >> BigInt(8);
        }
        this.encoded.store_bytes(new Uint8Array(buffer));
    };
    BorshSerializer.prototype.encode_string = function (value) {
        this.checkTypes && utils.expect_type(value, 'string', this.fieldPath);
        var _value = value;
        // encode to utf8 bytes without using TextEncoder
        var utf8Bytes = [];
        for (var i = 0; i < _value.length; i++) {
            var charCode = _value.charCodeAt(i);
            if (charCode < 0x80) {
                utf8Bytes.push(charCode);
            }
            else if (charCode < 0x800) {
                utf8Bytes.push(0xc0 | (charCode >> 6), 0x80 | (charCode & 0x3f));
            }
            else if (charCode < 0xd800 || charCode >= 0xe000) {
                utf8Bytes.push(0xe0 | (charCode >> 12), 0x80 | ((charCode >> 6) & 0x3f), 0x80 | (charCode & 0x3f));
            }
            else {
                i++;
                charCode = 0x10000 + (((charCode & 0x3ff) << 10) | (_value.charCodeAt(i) & 0x3ff));
                utf8Bytes.push(0xf0 | (charCode >> 18), 0x80 | ((charCode >> 12) & 0x3f), 0x80 | ((charCode >> 6) & 0x3f), 0x80 | (charCode & 0x3f));
            }
        }
        // 4 bytes for length + string bytes
        this.encoded.store_value(utf8Bytes.length, 'u32');
        this.encoded.store_bytes(new Uint8Array(utf8Bytes));
    };
    BorshSerializer.prototype.encode_boolean = function (value) {
        this.checkTypes && utils.expect_type(value, 'boolean', this.fieldPath);
        this.encoded.store_value(value ? 1 : 0, 'u8');
    };
    BorshSerializer.prototype.encode_option = function (value, schema) {
        if (value === null || value === undefined) {
            this.encoded.store_value(0, 'u8');
        }
        else {
            this.encoded.store_value(1, 'u8');
            this.encode_value(value, schema.option);
        }
    };
    BorshSerializer.prototype.encode_enum = function (value, schema) {
        this.checkTypes && utils.expect_enum(value, this.fieldPath);
        var valueKey = Object.keys(value)[0];
        for (var i = 0; i < schema["enum"].length; i++) {
            var valueSchema = schema["enum"][i];
            if (valueKey === Object.keys(valueSchema.struct)[0]) {
                this.encoded.store_value(i, 'u8');
                return this.encode_struct(value, valueSchema);
            }
        }
        throw new Error("Enum key (".concat(valueKey, ") not found in enum schema: ").concat(JSON.stringify(schema), " at ").concat(this.fieldPath.join('.')));
    };
    BorshSerializer.prototype.encode_array = function (value, schema) {
        if (utils.isArrayLike(value))
            return this.encode_arraylike(value, schema);
        if (value instanceof ArrayBuffer)
            return this.encode_buffer(value, schema);
        throw new Error("Expected Array-like not ".concat(typeof (value), "(").concat(value, ") at ").concat(this.fieldPath.join('.')));
    };
    BorshSerializer.prototype.encode_arraylike = function (value, schema) {
        if (schema.array.len) {
            utils.expect_same_size(value.length, schema.array.len, this.fieldPath);
        }
        else {
            // 4 bytes for length
            this.encoded.store_value(value.length, 'u32');
        }
        // array values
        for (var i = 0; i < value.length; i++) {
            this.encode_value(value[i], schema.array.type);
        }
    };
    BorshSerializer.prototype.encode_buffer = function (value, schema) {
        if (schema.array.len) {
            utils.expect_same_size(value.byteLength, schema.array.len, this.fieldPath);
        }
        else {
            // 4 bytes for length
            this.encoded.store_value(value.byteLength, 'u32');
        }
        // array values
        this.encoded.store_bytes(new Uint8Array(value));
    };
    BorshSerializer.prototype.encode_set = function (value, schema) {
        this.checkTypes && utils.expect_type(value, 'object', this.fieldPath);
        var isSet = value instanceof Set;
        var values = isSet ? Array.from(value.values()) : Object.values(value);
        // 4 bytes for length
        this.encoded.store_value(values.length, 'u32');
        // set values
        for (var _i = 0, values_1 = values; _i < values_1.length; _i++) {
            var value_1 = values_1[_i];
            this.encode_value(value_1, schema.set);
        }
    };
    BorshSerializer.prototype.encode_map = function (value, schema) {
        this.checkTypes && utils.expect_type(value, 'object', this.fieldPath);
        var isMap = value instanceof Map;
        var keys = isMap ? Array.from(value.keys()) : Object.keys(value);
        // 4 bytes for length
        this.encoded.store_value(keys.length, 'u32');
        // store key/values
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var key = keys_1[_i];
            this.encode_value(key, schema.map.key);
            this.encode_value(isMap ? value.get(key) : value[key], schema.map.value);
        }
    };
    BorshSerializer.prototype.encode_struct = function (value, schema) {
        this.checkTypes && utils.expect_type(value, 'object', this.fieldPath);
        for (var _i = 0, _a = Object.keys(schema.struct); _i < _a.length; _i++) {
            var key = _a[_i];
            this.fieldPath.push(key);
            this.encode_value(value[key], schema.struct[key]);
            this.fieldPath.pop();
        }
    };
    return BorshSerializer;
}());
export { BorshSerializer };
