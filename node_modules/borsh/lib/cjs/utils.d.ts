import { Schema } from './types.js';
export declare function isArrayLike(value: unknown): boolean;
export declare function expect_type(value: unknown, type: string, fieldPath: string[]): void;
export declare function expect_bigint(value: unknown, fieldPath: string[]): void;
export declare function expect_same_size(length: number, expected: number, fieldPath: string[]): void;
export declare function expect_enum(value: unknown, fieldPath: string[]): void;
export declare class ErrorSchema extends Error {
    constructor(schema: Schema, expected: string);
}
export declare function validate_schema(schema: Schema): void;
