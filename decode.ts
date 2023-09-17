import { RelatedObject, RelateRules, StringTransformer } from "./types.ts";

export interface DecodeOptions {
  offset?: number;
  littleEndian?: boolean;
}

const textDecoder = new TextDecoder();
const textEncoder = new TextEncoder();

const defaultStringTransformer: StringTransformer = {
  encode: (value: string) => textEncoder.encode(value),
  decode: (bytes: Uint8Array) => {
    const found = bytes.findIndex((v) => v === 0);
    return textDecoder.decode(bytes.slice(0, found));
  },
};

function* decodeIterate<T extends RelateRules>(
  rules: T,
  buffer: ArrayBuffer,
  { offset = 0, littleEndian = false }: DecodeOptions = {},
): Generator<RelatedObject<T>> {
  const view = new DataView(buffer);

  function _decode(rules: RelateRules) {
    const decoded = {} as Record<string, unknown>;
    for (const rule of rules) {
      let value: unknown;
      switch (rule.type) {
        case "f64": {
          value = view.getFloat64(offset, littleEndian);
          offset += 8;
          break;
        }
        case "f32": {
          value = view.getFloat32(offset, littleEndian);
          offset += 4;
          break;
        }
        case "i64": {
          value = view.getBigInt64(offset, littleEndian);
          offset += 8;
          break;
        }
        case "u64": {
          value = view.getBigUint64(offset, littleEndian);
          offset += 8;
          break;
        }
        case "i32": {
          value = view.getInt32(offset, littleEndian);
          offset += 4;
          break;
        }
        case "u32": {
          value = view.getUint32(offset, littleEndian);
          offset += 4;
          break;
        }
        case "i16": {
          value = view.getInt16(offset, littleEndian);
          offset += 2;
          break;
        }
        case "u16": {
          value = view.getUint16(offset, littleEndian);
          offset += 2;
          break;
        }
        case "i8": {
          value = view.getInt8(offset);
          offset += 1;
          break;
        }
        case "u8": {
          value = view.getUint8(offset);
          offset += 1;
          break;
        }
        case "string": {
          const transformer = rule.transformer ??
            defaultStringTransformer;
          value = transformer.decode(
            new Uint8Array(buffer, offset, rule.size),
          );
          offset += rule.size;
          break;
        }
        case "object": {
          value = _decode(rule.of);
          break;
        }
      }
      decoded[rule.name] = value;
    }
    return decoded;
  }

  while (offset < buffer.byteLength) {
    try {
      yield _decode(rules) as RelatedObject<T>;
    } catch (e) {
      if (e instanceof RangeError) {
        break;
      }
      throw e;
    }
  }
}

export interface DecodeManyOptions extends DecodeOptions {
  limit?: number;
}
export function decodeMany<T extends RelateRules>(
  rules: T,
  buffer: ArrayBuffer,
  { limit = Infinity, ...options }: DecodeManyOptions = {},
): RelatedObject<T>[] {
  const items: RelatedObject<T>[] = [];
  for (const item of decodeIterate(rules, buffer, options)) {
    items.push(item);
    if (items.length >= limit) break;
  }
  return items;
}

export function decode<T extends RelateRules>(
  rules: T,
  buffer: ArrayBuffer,
  options: DecodeOptions = {},
): RelatedObject<T> {
  const items = decodeMany(rules, buffer, { limit: 1, ...options });
  return items[0];
}
