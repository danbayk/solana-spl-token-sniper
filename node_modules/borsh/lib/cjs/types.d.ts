export declare const integers: string[];
export type IntegerType = typeof integers[number];
export type BoolType = 'bool';
export type StringType = 'string';
export type OptionType = {
    option: Schema;
};
export type ArrayType = {
    array: {
        type: Schema;
        len?: number;
    };
};
export type EnumType = {
    enum: Array<StructType>;
};
export type SetType = {
    set: Schema;
};
export type MapType = {
    map: {
        key: Schema;
        value: Schema;
    };
};
export type StructType = {
    struct: {
        [key: string]: Schema;
    };
};
export type Schema = IntegerType | BoolType | StringType | OptionType | ArrayType | EnumType | SetType | MapType | StructType;
export type DecodeTypes = number | bigint | string | boolean | Array<DecodeTypes> | EnumType | ArrayBuffer | Map<DecodeTypes, DecodeTypes> | Set<DecodeTypes> | object | null;
