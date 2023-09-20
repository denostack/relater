import { OffsetArrayBuffer } from "./offset_array_buffer.ts";
import { getSize } from "./size.ts";
import { defaultStringTransformer } from "./transformer.ts";
import { DecodeRule, RelateEntries, RelateRule } from "./types.ts";

export interface EncodeOptions {
  littleEndian?: boolean;
}

function _encodeEntries(
  buffer: OffsetArrayBuffer,
  value: Record<string, unknown>,
  entries: RelateEntries,
  options: EncodeOptions,
) {
  for (const { name, ...rule } of entries) {
    // deno-lint-ignore no-explicit-any
    _encode(buffer, value[name] as any, rule, options);
  }
}

function _encode<T extends RelateRule>(
  buffer: OffsetArrayBuffer,
  value: DecodeRule<T>,
  rule: T,
  options: EncodeOptions = {},
) {
  const view = new DataView(buffer.raw);
  switch (rule.type) {
    case "f64": {
      view.setFloat64(
        buffer.offset,
        value as number,
        rule.littleEndian ?? options.littleEndian,
      );
      buffer.offset += 8;
      break;
    }
    case "f32": {
      view.setFloat32(
        buffer.offset,
        value as number,
        rule.littleEndian ?? options.littleEndian,
      );
      buffer.offset += 4;
      break;
    }
    case "i64": {
      view.setBigInt64(
        buffer.offset,
        value as bigint,
        rule.littleEndian ?? options.littleEndian,
      );
      buffer.offset += 8;
      break;
    }
    case "u64": {
      view.setBigUint64(
        buffer.offset,
        value as bigint,
        rule.littleEndian ?? options.littleEndian,
      );
      buffer.offset += 8;
      break;
    }
    case "i32": {
      view.setInt32(
        buffer.offset,
        value as number,
        rule.littleEndian ?? options.littleEndian,
      );
      buffer.offset += 4;
      break;
    }
    case "u32": {
      view.setUint32(
        buffer.offset,
        value as number,
        rule.littleEndian ?? options.littleEndian,
      );
      buffer.offset += 4;
      break;
    }
    case "i16": {
      view.setInt16(
        buffer.offset,
        value as number,
        rule.littleEndian ?? options.littleEndian,
      );
      buffer.offset += 2;
      break;
    }
    case "u16": {
      view.setUint16(
        buffer.offset,
        value as number,
        rule.littleEndian ?? options.littleEndian,
      );
      buffer.offset += 2;
      break;
    }
    case "i8": {
      view.setInt8(buffer.offset, value as number);
      buffer.offset += 1;
      break;
    }
    case "u8": {
      view.setUint8(buffer.offset, value as number);
      buffer.offset += 1;
      break;
    }
    case "string": {
      const transformer = rule.transformer ??
        defaultStringTransformer;
      const target = new Uint8Array(buffer.raw, buffer.offset, rule.size);
      const bytes = transformer.encode(value as string);
      target.fill(0);
      target.set(bytes.slice(0, rule.size));
      buffer.offset += rule.size;
      break;
    }
    case "object": {
      if (typeof value !== "object" || value === null) {
        throw new TypeError("Expected object");
      }
      _encodeEntries(
        buffer,
        value as Record<string, unknown>,
        rule.of,
        options,
      );
      break;
    }
    case "array": {
      if (!Array.isArray(value)) throw new TypeError("Expected array");
      for (let i = 0; i < rule.size; i++) {
        _encode(buffer, value[i], rule.of, options);
      }
      break;
    }
  }
  return value as DecodeRule<T>;
}

export function encode<T extends RelateRule>(
  value: DecodeRule<T>,
  rule: T,
  options: EncodeOptions = {},
): ArrayBuffer {
  const buffer = new OffsetArrayBuffer(new ArrayBuffer(getSize(rule)));
  _encode(
    buffer,
    value,
    rule,
    options,
  );
  return buffer.raw;
}
