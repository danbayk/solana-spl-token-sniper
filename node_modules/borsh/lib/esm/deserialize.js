import { integers } from './types.js';
import { DecodeBuffer } from './buffer.js';
var BorshDeserializer = /** @class */ (function () {
    function BorshDeserializer(bufferArray) {
        this.buffer = new DecodeBuffer(bufferArray);
    }
    BorshDeserializer.prototype.decode = function (schema) {
        return this.decode_value(schema);
    };
    BorshDeserializer.prototype.decode_value = function (schema) {
        if (typeof schema === 'string') {
            if (integers.includes(schema))
                return this.decode_integer(schema);
            if (schema === 'string')
                return this.decode_string();
            if (schema === 'bool')
                return this.decode_boolean();
        }
        if (typeof schema === 'object') {
            if ('option' in schema)
                return this.decode_option(schema);
            if ('enum' in schema)
                return this.decode_enum(schema);
            if ('array' in schema)
                return this.decode_array(schema);
            if ('set' in schema)
                return this.decode_set(schema);
            if ('map' in schema)
                return this.decode_map(schema);
            if ('struct' in schema)
                return this.decode_struct(schema);
        }
        throw new Error("Unsupported type: ".concat(schema));
    };
    BorshDeserializer.prototype.decode_integer = function (schema) {
        var size = parseInt(schema.substring(1));
        if (size <= 32 || schema == 'f64') {
            return this.buffer.consume_value(schema);
        }
        return this.decode_bigint(size, schema.startsWith('i'));
    };
    BorshDeserializer.prototype.decode_bigint = function (size, signed) {
        if (signed === void 0) { signed = false; }
        var buffer_len = size / 8;
        var buffer = new Uint8Array(this.buffer.consume_bytes(buffer_len));
        var bits = buffer.reduceRight(function (r, x) { return r + x.toString(16).padStart(2, '0'); }, '');
        if (signed && buffer[buffer_len - 1]) {
            return BigInt.asIntN(size, BigInt("0x".concat(bits)));
        }
        return BigInt("0x".concat(bits));
    };
    BorshDeserializer.prototype.decode_string = function () {
        var len = this.decode_integer('u32');
        var buffer = new Uint8Array(this.buffer.consume_bytes(len));
        // decode utf-8 string without using TextDecoder
        // first get all bytes to single byte code points
        var codePoints = [];
        for (var i = 0; i < len; ++i) {
            var byte = buffer[i];
            if (byte < 0x80) {
                codePoints.push(byte);
            }
            else if (byte < 0xE0) {
                codePoints.push(((byte & 0x1F) << 6) | (buffer[++i] & 0x3F));
            }
            else if (byte < 0xF0) {
                codePoints.push(((byte & 0x0F) << 12) | ((buffer[++i] & 0x3F) << 6) | (buffer[++i] & 0x3F));
            }
            else {
                var codePoint = ((byte & 0x07) << 18) | ((buffer[++i] & 0x3F) << 12) | ((buffer[++i] & 0x3F) << 6) | (buffer[++i] & 0x3F);
                codePoints.push(codePoint);
            }
        }
        // then decode code points to utf-8
        return String.fromCodePoint.apply(String, codePoints);
    };
    BorshDeserializer.prototype.decode_boolean = function () {
        return this.buffer.consume_value('u8') > 0;
    };
    BorshDeserializer.prototype.decode_option = function (schema) {
        var option = this.buffer.consume_value('u8');
        if (option === 1) {
            return this.decode_value(schema.option);
        }
        if (option !== 0) {
            throw new Error("Invalid option ".concat(option));
        }
        return null;
    };
    BorshDeserializer.prototype.decode_enum = function (schema) {
        var _a;
        var valueIndex = this.buffer.consume_value('u8');
        if (valueIndex > schema["enum"].length) {
            throw new Error("Enum option ".concat(valueIndex, " is not available"));
        }
        var struct = schema["enum"][valueIndex].struct;
        var key = Object.keys(struct)[0];
        return _a = {}, _a[key] = this.decode_value(struct[key]), _a;
    };
    BorshDeserializer.prototype.decode_array = function (schema) {
        var result = [];
        var len = schema.array.len ? schema.array.len : this.decode_integer('u32');
        for (var i = 0; i < len; ++i) {
            result.push(this.decode_value(schema.array.type));
        }
        return result;
    };
    BorshDeserializer.prototype.decode_set = function (schema) {
        var len = this.decode_integer('u32');
        var result = new Set();
        for (var i = 0; i < len; ++i) {
            result.add(this.decode_value(schema.set));
        }
        return result;
    };
    BorshDeserializer.prototype.decode_map = function (schema) {
        var len = this.decode_integer('u32');
        var result = new Map();
        for (var i = 0; i < len; ++i) {
            var key = this.decode_value(schema.map.key);
            var value = this.decode_value(schema.map.value);
            result.set(key, value);
        }
        return result;
    };
    BorshDeserializer.prototype.decode_struct = function (schema) {
        var result = {};
        for (var key in schema.struct) {
            result[key] = this.decode_value(schema.struct[key]);
        }
        return result;
    };
    return BorshDeserializer;
}());
export { BorshDeserializer };
