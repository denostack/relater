import type { Equal, Expect } from "@type-challenges/utils";
import { assertEquals } from "assert/mod.ts";

import { DecodeRule } from "./types.ts";

Deno.test("types, estimate simple types", () => {
  assertEquals(true, true);

  type TestCases = [
    Expect<
      Equal<
        DecodeRule<{ type: "i8" }>,
        number
      >
    >,
    Expect<
      Equal<
        DecodeRule<{ type: "u8" }>,
        number
      >
    >,
    Expect<
      Equal<
        DecodeRule<{ type: "i16" }>,
        number
      >
    >,
    Expect<
      Equal<
        DecodeRule<{ type: "u16" }>,
        number
      >
    >,
    Expect<
      Equal<
        DecodeRule<{ type: "i32" }>,
        number
      >
    >,
    Expect<
      Equal<
        DecodeRule<{ type: "u32" }>,
        number
      >
    >,
    Expect<
      Equal<
        DecodeRule<{ type: "i64" }>,
        bigint
      >
    >,
    Expect<
      Equal<
        DecodeRule<{ type: "u64" }>,
        bigint
      >
    >,
    Expect<
      Equal<
        DecodeRule<{ type: "f32" }>,
        number
      >
    >,
    Expect<
      Equal<
        DecodeRule<{ type: "f64" }>,
        number
      >
    >,
    Expect<
      Equal<
        DecodeRule<{ type: "string"; size: 16 }>,
        string
      >
    >,
    Expect<
      Equal<
        DecodeRule<{
          type: "string";
          size: 16;
          transformer: {
            encode: (value: string) => Uint8Array;
            decode: (value: Uint8Array) => string;
          };
        }>,
        string
      >
    >,
  ];
});

Deno.test("types, estimate object", () => {
  assertEquals(true, true);

  type TestCases = [
    Expect<
      Equal<
        DecodeRule<
          {
            type: "object";
            of: [
              { name: "i8"; type: "i8" },
              { name: "u8"; type: "u8" },
              { name: "i16"; type: "i16" },
              { name: "u16"; type: "u16" },
              { name: "i32"; type: "i32" },
              { name: "u32"; type: "u32" },
              { name: "i64"; type: "i64" },
              { name: "u64"; type: "u64" },
              { name: "f32"; type: "f32" },
              { name: "f64"; type: "f64" },
              { name: "string"; type: "string"; size: 16 },
            ];
          }
        >,
        {
          i8: number;
          u8: number;
          i16: number;
          u16: number;
          i32: number;
          u32: number;
          i64: bigint;
          u64: bigint;
          f32: number;
          f64: number;
          string: string;
        }
      >
    >,
  ];
});

Deno.test("types, estimate array", () => {
  assertEquals(true, true);

  type TestCases = [
    Expect<
      Equal<
        DecodeRule<
          {
            type: "array";
            of: { type: "i8" };
            size: 4;
          }
        >,
        number[]
      >
    >,
    Expect<
      Equal<
        DecodeRule<
          {
            type: "array";
            of: {
              type: "object";
              of: [{ name: "x"; type: "u8" }, { name: "y"; type: "u8" }];
            };
            size: 4;
          }
        >,
        { x: number; y: number }[]
      >
    >,
  ];
});

Deno.test("types, estimate nested object", () => {
  assertEquals(true, true);

  type TestCases = [
    Expect<
      Equal<
        DecodeRule<
          {
            type: "object";
            of: [
              {
                name: "name";
                type: "string";
                size: 10;
                transformer: {
                  encode: (value: string) => Uint8Array;
                  decode: (value: Uint8Array) => string;
                };
              },
              {
                name: "from";
                type: "object";
                of: [{ name: "x"; type: "u8" }, { name: "y"; type: "u8" }];
              },
              {
                name: "to";
                type: "object";
                of: [{ name: "x"; type: "u8" }, { name: "y"; type: "u8" }];
              },
            ];
          }
        >,
        {
          name: string;
          from: { x: number; y: number };
          to: { x: number; y: number };
        }
      >
    >,
  ];
});
