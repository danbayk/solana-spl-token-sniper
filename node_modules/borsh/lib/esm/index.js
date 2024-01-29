import { BorshSerializer } from './serialize.js';
import { BorshDeserializer } from './deserialize.js';
import * as utils from './utils.js';
export function serialize(schema, value, validate) {
    if (validate === void 0) { validate = true; }
    if (validate)
        utils.validate_schema(schema);
    var serializer = new BorshSerializer(validate);
    return serializer.encode(value, schema);
}
export function deserialize(schema, buffer, validate) {
    if (validate === void 0) { validate = true; }
    if (validate)
        utils.validate_schema(schema);
    var deserializer = new BorshDeserializer(buffer);
    return deserializer.decode(schema);
}
