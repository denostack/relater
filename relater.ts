// import { bufferToString } from './buffer';

export type RelateRules = RelateRule[] | ReadonlyArray<RelateRule>;

export type RelateRule =
  | RelateFixedSizeRule
  | RelateSizeRule;

export interface RelateFixedSizeRule {
  name: string;
  type:
    | "f64"
    | "float32"
    | "i64"
    | "u64"
    | "i32"
    | "u32"
    | "i16"
    | "u16"
    | "i8"
    | "u8";
}

export interface RelateSizeRule {
  name: string;
  type: "string";
  size: number;
}

type EstimatedType<T> = T extends
  | "f64"
  | "float32"
  | "i32"
  | "u32"
  | "i16"
  | "u16"
  | "i8"
  | "u8" ? number
  : T extends "i64" | "u64" ? bigint
  : T extends "string" ? string
  : never;

type MergeObject<TObj> = { [key in keyof TObj]: TObj[key] };
type DeepWritable<TObj> = {
  -readonly [P in keyof TObj]: DeepWritable<TObj[P]>;
};

// https://stackoverflow.com/a/50375286
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends
  ((k: infer I) => void) ? I : never;

type UnionObjectFromRules<TRules extends RelateRules> =
  DeepWritable<TRules> extends (infer R)[]
    ? R extends { name: infer TKey; type: infer TType }
      ? { [prop in TKey & PropertyKey]: EstimatedType<TType> }
    : never
    : never;

export type RelatedObject<T extends RelateRules> = MergeObject<
  UnionToIntersection<UnionObjectFromRules<T>>
>;

export interface RelaterOptions {
  readonly littleEndian?: boolean;
}

function getSize(rule: RelateRule) {
  switch (rule.type) {
    case "f64":
    case "i64":
    case "u64":
      return 8;
    case "float32":
    case "i32":
    case "u32":
      return 4;
    case "i16":
    case "u16":
      return 2;
    case "i8":
    case "u8":
      return 1;
  }
  return rule.size;
}

export class Relater<T extends RelateRules> {
  constructor(
    public rules: T,
    public options: RelaterOptions = {},
  ) {}

  relate(buffer: ArrayBuffer): RelatedObject<T> {
    const view = new DataView(buffer);
    let carryOffset = 0;
    return Object.create(
      {},
      Object.fromEntries(
        this.rules.map((rule): [string, PropertyDescriptor] => {
          const offset = carryOffset;
          carryOffset += getSize(rule);
          switch (rule.type) {
            case "f64": {
              return [rule.name, {
                enumerable: true,
                get: () => view.getFloat64(offset, this.options.littleEndian),
                set: (value: number) =>
                  view.setFloat64(
                    offset,
                    value,
                    this.options.littleEndian,
                  ),
              }];
            }
            case "float32": {
              return [rule.name, {
                enumerable: true,
                get: () => view.getFloat32(offset, this.options.littleEndian),
                set: (value: number) =>
                  view.setFloat32(
                    offset,
                    value,
                    this.options.littleEndian,
                  ),
              }];
            }
            case "i64": {
              return [rule.name, {
                enumerable: true,
                get: () => view.getBigInt64(offset, this.options.littleEndian),
                set: (value: bigint) =>
                  view.setBigInt64(
                    offset,
                    value,
                    this.options.littleEndian,
                  ),
              }];
            }
            case "u64": {
              return [rule.name, {
                enumerable: true,
                get: () => view.getBigUint64(offset, this.options.littleEndian),
                set: (value: bigint) =>
                  view.setBigUint64(
                    offset,
                    value,
                    this.options.littleEndian,
                  ),
              }];
            }
            case "i32": {
              return [rule.name, {
                enumerable: true,
                get: () => view.getInt32(offset, this.options.littleEndian),
                set: (value: number) =>
                  view.setInt32(
                    offset,
                    value,
                    this.options.littleEndian,
                  ),
              }];
            }
            case "u32": {
              return [rule.name, {
                enumerable: true,
                get: () => view.getUint32(offset, this.options.littleEndian),
                set: (value: number) =>
                  view.setUint32(
                    offset,
                    value,
                    this.options.littleEndian,
                  ),
              }];
            }
            case "i16": {
              return [rule.name, {
                enumerable: true,
                get: () => view.getInt16(offset, this.options.littleEndian),
                set: (value: number) =>
                  view.setInt16(
                    offset,
                    value,
                    this.options.littleEndian,
                  ),
              }];
            }
            case "u16": {
              return [rule.name, {
                enumerable: true,
                get: () => view.getUint16(offset, this.options.littleEndian),
                set: (value: number) =>
                  view.setUint16(
                    offset,
                    value,
                    this.options.littleEndian,
                  ),
              }];
            }
            case "i8": {
              return [rule.name, {
                enumerable: true,
                get: () => view.getInt8(offset),
                set: (value: number) =>
                  view.setInt8(
                    offset,
                    value,
                  ),
              }];
            }
            case "u8": {
              return [rule.name, {
                enumerable: true,
                get: () => view.getUint8(offset),
                set: (value: number) =>
                  view.setUint8(
                    offset,
                    value,
                  ),
              }];
            }
          }

          throw new Error(`Unknown type: ${rule.type}`);
        }),
      ),
    );
  }
}
