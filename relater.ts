import { decode, DecodeOptions } from "./decode.ts";
import { encode, EncodeOptions } from "./encode.ts";
import { OffsetArrayBuffer } from "./offset_array_buffer.ts";
import { getSize } from "./size.ts";
import { DecodeRule, RelateRule } from "./types.ts";

export interface RelaterOptions {
  readonly littleEndian?: boolean;
}

export class Relater<T extends RelateRule, TValue = DecodeRule<T>> {
  constructor(
    public rule: T,
    public options: RelaterOptions = {},
  ) {}

  get size(): number {
    return getSize(this.rule);
  }

  encode(
    value: TValue,
    options?: EncodeOptions,
  ): ArrayBuffer {
    return encode(value, this.rule, {
      ...this.options,
      ...options,
    });
  }

  decode(
    buffer: ArrayBuffer | OffsetArrayBuffer,
    options?: DecodeOptions,
  ): TValue {
    return decode(buffer, this.rule, {
      ...this.options,
      ...options,
    });
  }
}
