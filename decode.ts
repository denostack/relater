import { OffsetArrayBuffer } from "./offset_array_buffer.ts";
import { defaultStringTransformer } from "./transformer.ts";
import { DecodeRule, RelateEntries, RelateRule } from "./types.ts";

export interface DecodeOptions {
  littleEndian?: boolean;
}

function _decodeEntries(
  buffer: OffsetArrayBuffer,
  entries: RelateEntries,
  options: DecodeOptions,
) {
  const decoded: Record<string, unknown> = {};
  for (const { name, ...rule } of entries) {
    decoded[name] = _decode(buffer, rule, options);
  }
  return decoded;
}

function _decode<T extends RelateRule>(
  buffer: OffsetArrayBuffer,
  rule: T,
  options: DecodeOptions = {},
): DecodeRule<T> {
  const view = new DataView(buffer.raw);
  let value: unknown;
  switch (rule.type) {
    case "f64": {
      value = view.getFloat64(
        buffer.offset,
        rule.littleEndian ?? options.littleEndian,
      );
      buffer.offset += 8;
      break;
    }
    case "f32": {
      value = view.getFloat32(
        buffer.offset,
        rule.littleEndian ?? options.littleEndian,
      );
      buffer.offset += 4;
      break;
    }
    case "i64": {
      value = view.getBigInt64(
        buffer.offset,
        rule.littleEndian ?? options.littleEndian,
      );
      buffer.offset += 8;
      break;
    }
    case "u64": {
      value = view.getBigUint64(
        buffer.offset,
        rule.littleEndian ?? options.littleEndian,
      );
      buffer.offset += 8;
      break;
    }
    case "i32": {
      value = view.getInt32(
        buffer.offset,
        rule.littleEndian ?? options.littleEndian,
      );
      buffer.offset += 4;
      break;
    }
    case "u32": {
      value = view.getUint32(
        buffer.offset,
        rule.littleEndian ?? options.littleEndian,
      );
      buffer.offset += 4;
      break;
    }
    case "i16": {
      value = view.getInt16(
        buffer.offset,
        rule.littleEndian ?? options.littleEndian,
      );
      buffer.offset += 2;
      break;
    }
    case "u16": {
      value = view.getUint16(
        buffer.offset,
        rule.littleEndian ?? options.littleEndian,
      );
      buffer.offset += 2;
      break;
    }
    case "i8": {
      value = view.getInt8(buffer.offset);
      buffer.offset += 1;
      break;
    }
    case "u8": {
      value = view.getUint8(buffer.offset);
      buffer.offset += 1;
      break;
    }
    case "string": {
      const transformer = rule.transformer ??
        defaultStringTransformer;
      value = transformer.decode(
        new Uint8Array(buffer.raw, buffer.offset, rule.size),
      );
      buffer.offset += rule.size;
      break;
    }
    case "object": {
      value = _decodeEntries(buffer, rule.of, options);
      break;
    }
    case "array": {
      const array: unknown[] = [];
      for (let i = 0; i < rule.size; i++) {
        array.push(_decode(buffer, rule.of, options));
      }
      value = array;
      break;
    }
  }
  return value as DecodeRule<T>;
}

export function decode<T extends RelateRule>(
  buffer: ArrayBuffer | OffsetArrayBuffer,
  rule: T,
  options: DecodeOptions = {},
): DecodeRule<T> {
  return _decode(
    buffer instanceof ArrayBuffer ? { raw: buffer, offset: 0 } : buffer,
    rule,
    options,
  );
}
