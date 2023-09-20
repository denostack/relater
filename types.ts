export interface StringTransformer {
  encode: (value: string) => Uint8Array;
  decode: (value: Uint8Array) => string;
}

export type RelateRule =
  | RelateRuleNumber
  | RelateRuleMultiByteNumber
  | RelateRuleBigInt
  | RelateRuleString
  | RelateRuleObject
  | RelateRuleArray;

export interface RelateRuleNumber {
  type:
    | "i8"
    | "u8";
}

export interface RelateRuleMultiByteNumber {
  type:
    | "f64"
    | "f32"
    | "i32"
    | "u32"
    | "i16"
    | "u16";
  littleEndian?: boolean;
}

export interface RelateRuleBigInt {
  type: "i64" | "u64";
  littleEndian?: boolean;
}

export interface RelateRuleString {
  type: "string";
  size: number;
  transformer?: StringTransformer;
}

export interface RelateRuleObject {
  type: "object";
  of: RelateEntries;
}

export type RelateEntries = RelateEntry[] | ReadonlyArray<RelateEntry>;
export type RelateEntry = { name: string } & RelateRule;

export interface RelateRuleArray {
  type: "array";
  size: number;
  of: RelateRule;
}

type MergeObject<TObj> = { [key in keyof TObj]: TObj[key] };
type DeepWritable<TObj> = {
  -readonly [P in keyof TObj]: DeepWritable<TObj[P]>;
};

// https://stackoverflow.com/a/50375286
// deno-lint-ignore no-explicit-any
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends
  ((k: infer I) => void) ? I : never;

type DecodeEntries<T> = MergeObject<
  UnionToIntersection<
    DeepWritable<T> extends (infer R)[] ? DecodeEntry<R> : never
  >
>;
type DecodeEntry<T> = T extends RelateEntry
  ? { [prop in T["name"] & PropertyKey]: DecodeRule<T> }
  : never;

export type DecodeRule<T extends RelateRule> = T extends RelateRuleNumber
  ? number
  : T extends RelateRuleMultiByteNumber ? number
  : T extends RelateRuleBigInt ? bigint
  : T extends RelateRuleString ? string
  : T extends RelateRuleObject ? DecodeEntries<T["of"]>
  : T extends RelateRuleArray ? DecodeRule<T["of"]>[]
  : never;
