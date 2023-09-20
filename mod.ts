/**
 * @module
 */

export { Relater, type RelaterOptions } from "./relater.ts";

export { OffsetArrayBuffer } from "./offset_array_buffer.ts";
export { defaultStringTransformer } from "./transformer.ts";
export { getSize } from "./size.ts";
export { decode, type DecodeOptions } from "./decode.ts";
export type {
  DecodeRule,
  RelateEntries,
  RelateEntry,
  RelateRule,
  RelateRuleArray,
  RelateRuleBigInt,
  RelateRuleMultiByteNumber,
  RelateRuleNumber,
  RelateRuleObject,
  RelateRuleString,
  StringTransformer,
} from "./types.ts";
