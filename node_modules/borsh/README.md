# Borsh JS

[![Project license](https://img.shields.io/badge/license-Apache2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Project license](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Discord](https://img.shields.io/discord/490367152054992913?label=discord)](https://discord.gg/Vyp7ETM)
[![Travis status](https://travis-ci.com/near/borsh.svg?branch=master)](https://travis-ci.com/near/borsh-js)
[![NPM version](https://img.shields.io/npm/v/borsh.svg?style=flat-square)](https://npmjs.com/borsh)
[![Size on NPM](https://img.shields.io/bundlephobia/minzip/borsh.svg?style=flat-square)](https://npmjs.com/borsh)

**Borsh JS** is an implementation of the [Borsh] binary serialization format for
JavaScript and TypeScript projects.

Borsh stands for _Binary Object Representation Serializer for Hashing_. It is meant to be used in security-critical projects as it prioritizes consistency,
safety, speed, and comes with a strict specification.

## Examples

### (De)serializing a Value
```javascript
import * as borsh from 'borsh';

const encodedU16 = borsh.serialize('u16', 2);
const decodedU16 = borsh.deserialize('u16', encodedU16);

const encodedStr = borsh.serialize('string', 'testing');
const decodedStr = borsh.deserialize('string', encodedStr);
```

### (De)serializing an Object
```javascript
import * as borsh from 'borsh';

const value = {x: 255, y: BigInt(20), z: '123', arr: [1, 2, 3]};
const schema = { struct: { x: 'u8', y: 'u64', 'z': 'string', 'arr': { array: { type: 'u8' }}}};

const encoded = borsh.serialize(schema, value);
const decoded = borsh.deserialize(schema, encoded);
```

## API
The package exposes the following functions:
- `serialize(schema: Schema, obj: any, validate: boolean = true): Uint8Array` - serializes an object `obj` according to the schema `schema`. Setting `validate` to false will skip the validation of the `schema`.
- `deserialize(schema: Schema, buffer: Uint8Array, validate: boolean = true): any` - deserializes an object according to the schema `schema` from the buffer `buffer`. Setting `validate` to false will skip the validation of the `schema`.

## Schemas
Schemas are used to describe the structure of the data being serialized or deserialized. They are used to
validate the data and to determine the order of the fields in the serialized data.

> NOTE: You can find examples of valid in the [test](./borsh-ts/test/utils.test.js) folder.

### Basic Types
Basic types are described by a string. The following types are supported:
- `u8`, `u16`, `u32`, `u64`, `u128` - unsigned integers of 8, 16, 32, 64, and 128 bits respectively.
- `i8`, `i16`, `i32`, `i64`, `i128` - signed integers of 8, 16, 32, 64, and 128 bits respectively.
- `f32`, `f64` - IEEE 754 floating point numbers of 32 and 64 bits respectively.
- `bool` - boolean value.
- `string` - UTF-8 string.

### Arrays, Options, Maps, Sets, Enums, and Structs
More complex objects are described by a JSON object. The following types are supported:
- `{ array: { type: Schema, len?: number } }` - an array of objects of the same type. The type of the array elements is described by the `type` field. If the field `len` is present, the array is fixed-size and the length of the array is `len`. Otherwise, the array is dynamic-sized and the length of the array is serialized before the elements.
- `{ option: Schema }` - an optional object. The type of the object is described by the `type` field.
- `{ map: { key: Schema, value: Schema }}` - a map. The type of the keys and values are described by the `key` and `value` fields respectively.
- `{ set: Schema }` - a set. The type of the elements is described by the `type` field.
- `{ enum: [ { struct: { className1: structSchema1 } }, { struct: { className2: structSchema2 } }, ... ] }` - an enum. The variants of the enum are described by the `className1`, `className2`, etc. fields. The variants are structs.
- `{ struct: { field1: Schema1, field2: Schema2, ... } }` - a struct. The fields of the struct are described by the `field1`, `field2`, etc. fields.

### Type Mappings

| Javascript       | Borsh                             |
|------------------|-----------------------------------|
| `number`         | `u8` `u16` `u32` `i8` `i16` `i32` |
| `bigint`         | `u64` `u128` `i64` `i128`         |
| `number`         | `f32` `f64`                       |
| `number`         | `f32` `f64`                       |
| `boolean`        | `bool`                            |
| `string`         | UTF-8 string                      |
| `type[]`         | fixed-size byte array             |
| `type[]`         | dynamic sized array               |
| `object`         | enum                              |
| `Map`            | HashMap                           |
| `Set`            | HashSet                           |
| `null` or `type` | Option                            |


---

## Contributing

Install dependencies:
```bash
yarn install
```

Continuously build with:
```bash
yarn dev
```

Run tests:
```bash
yarn test
```

Run linter
```bash
yarn lint
```
## Publish

Prepare `dist` version by running:
```bash
yarn build
```

When publishing to npm use [np](https://github.com/sindresorhus/np).

# License
This repository is distributed under the terms of both the MIT license and the Apache License (Version 2.0).
See [LICENSE-MIT](LICENSE-MIT.txt) and [LICENSE-APACHE](LICENSE-APACHE) for details.

[Borsh]:          https://borsh.io
