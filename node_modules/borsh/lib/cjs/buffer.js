"use strict";
exports.__esModule = true;
exports.DecodeBuffer = exports.EncodeBuffer = void 0;
var EncodeBuffer = /** @class */ (function () {
    function EncodeBuffer() {
        this.offset = 0;
        this.buffer_size = 256;
        this.buffer = new ArrayBuffer(this.buffer_size);
        this.view = new DataView(this.buffer);
    }
    EncodeBuffer.prototype.resize_if_necessary = function (needed_space) {
        if (this.buffer_size - this.offset < needed_space) {
            this.buffer_size = Math.max(this.buffer_size * 2, this.buffer_size + needed_space);
            var new_buffer = new ArrayBuffer(this.buffer_size);
            new Uint8Array(new_buffer).set(new Uint8Array(this.buffer));
            this.buffer = new_buffer;
            this.view = new DataView(new_buffer);
        }
    };
    EncodeBuffer.prototype.get_used_buffer = function () {
        return new Uint8Array(this.buffer).slice(0, this.offset);
    };
    EncodeBuffer.prototype.store_value = function (value, type) {
        var bSize = type.substring(1);
        var size = parseInt(bSize) / 8;
        this.resize_if_necessary(size);
        var toCall = type[0] === 'f' ? "setFloat".concat(bSize) : type[0] === 'i' ? "setInt".concat(bSize) : "setUint".concat(bSize);
        this.view[toCall](this.offset, value, true);
        this.offset += size;
    };
    EncodeBuffer.prototype.store_bytes = function (from) {
        this.resize_if_necessary(from.length);
        new Uint8Array(this.buffer).set(new Uint8Array(from), this.offset);
        this.offset += from.length;
    };
    return EncodeBuffer;
}());
exports.EncodeBuffer = EncodeBuffer;
var DecodeBuffer = /** @class */ (function () {
    function DecodeBuffer(buf) {
        this.offset = 0;
        this.buffer_size = buf.length;
        this.buffer = new ArrayBuffer(buf.length);
        new Uint8Array(this.buffer).set(buf);
        this.view = new DataView(this.buffer);
    }
    DecodeBuffer.prototype.assert_enough_buffer = function (size) {
        if (this.offset + size > this.buffer.byteLength) {
            throw new Error('Error in schema, the buffer is smaller than expected');
        }
    };
    DecodeBuffer.prototype.consume_value = function (type) {
        var bSize = type.substring(1);
        var size = parseInt(bSize) / 8;
        this.assert_enough_buffer(size);
        var toCall = type[0] === 'f' ? "getFloat".concat(bSize) : type[0] === 'i' ? "getInt".concat(bSize) : "getUint".concat(bSize);
        var ret = this.view[toCall](this.offset, true);
        this.offset += size;
        return ret;
    };
    DecodeBuffer.prototype.consume_bytes = function (size) {
        this.assert_enough_buffer(size);
        var ret = this.buffer.slice(this.offset, this.offset + size);
        this.offset += size;
        return ret;
    };
    return DecodeBuffer;
}());
exports.DecodeBuffer = DecodeBuffer;
