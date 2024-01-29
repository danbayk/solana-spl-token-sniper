import { IntegerType } from './types.js';
export declare class EncodeBuffer {
    offset: number;
    buffer_size: number;
    buffer: ArrayBuffer;
    view: DataView;
    constructor();
    resize_if_necessary(needed_space: number): void;
    get_used_buffer(): Uint8Array;
    store_value(value: number, type: IntegerType): void;
    store_bytes(from: Uint8Array): void;
}
export declare class DecodeBuffer {
    offset: number;
    buffer_size: number;
    buffer: ArrayBuffer;
    view: DataView;
    constructor(buf: Uint8Array);
    assert_enough_buffer(size: number): void;
    consume_value(type: IntegerType): number;
    consume_bytes(size: number): ArrayBuffer;
}
