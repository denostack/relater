export interface StringTransformer {
  encode: (value: string) => Uint8Array;
  decode: (value: Uint8Array) => string;
}

export type RelateRules = RelateRule[] | ReadonlyArray<RelateRule>;

export type RelateRule =
  | RelateRuleNumber
  | RelateRuleBigInt
  | RelateRuleString
  | RelateRuleObject;

export interface RelateRuleNumber {
  name: string;
  type:
    | "f64"
    | "f32"
    | "i32"
    | "u32"
    | "i16"
    | "u16"
    | "i8"
    | "u8";
}

export interface RelateRuleBigInt {
  name: string;
  type: "i64" | "u64";
}

export interface RelateRuleString {
  name: string;
  type: "string";
  size: number;
  transformer?: StringTransformer;
}

export interface RelateRuleObject {
  name: string;
  type: "object";
  of: RelateRules;
}

type MergeObject<TObj> = { [key in keyof TObj]: TObj[key] };
type DeepWritable<TObj> = {
  -readonly [P in keyof TObj]: DeepWritable<TObj[P]>;
};

// https://stackoverflow.com/a/50375286
// deno-lint-ignore no-explicit-any
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends
  ((k: infer I) => void) ? I : never;

type UnionObjectFromRules<TRules extends RelateRules> =
  DeepWritable<TRules> extends (infer R)[] ? ParseRule<R>
    : never;

type ParseRule<T> = T extends RelateRuleNumber
  ? { [prop in T["name"] & PropertyKey]: number }
  : T extends RelateRuleBigInt ? { [prop in T["name"] & PropertyKey]: bigint }
  : T extends RelateRuleString ? { [prop in T["name"] & PropertyKey]: string }
  : T extends RelateRuleObject
    ? { [prop in T["name"] & PropertyKey]: RelatedObject<T["of"]> }
  : never;

export type RelatedObject<T extends RelateRules> = MergeObject<
  UnionToIntersection<UnionObjectFromRules<T>>
>;
