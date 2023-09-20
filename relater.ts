import { decode, DecodeOptions } from "./decode.ts";
import { OffsetArrayBuffer } from "./offset_array_buffer.ts";
import { getSize } from "./size.ts";
import { DecodeRule, RelateRule } from "./types.ts";

export interface RelaterOptions {
  readonly littleEndian?: boolean;
}

export class Relater<T extends RelateRule> {
  constructor(
    public rule: T,
    public options: RelaterOptions = {},
  ) {}

  get size(): number {
    return getSize(this.rule);
  }

  decode(
    buffer: ArrayBuffer | OffsetArrayBuffer,
    options?: DecodeOptions,
  ): DecodeRule<
    T
  > {
    return decode(buffer, this.rule, {
      ...this.options,
      ...options,
    });
  }
}
