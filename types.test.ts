import type { Equal, Expect } from "@type-challenges/utils";
import { assertEquals } from "assert/mod.ts";

import { RelatedObject } from "./mod.ts";
import { RelateRules } from "./types.ts";

Deno.test("types, estimate simple types", () => {
  assertEquals(true, true);
  const rules = [
    { name: "i8", type: "i8" },
    { name: "u8", type: "u8" },
    { name: "i16", type: "i16" },
    { name: "u16", type: "u16" },
    { name: "i32", type: "i32" },
    { name: "u32", type: "u32" },
    { name: "i64", type: "i64" },
    { name: "u64", type: "u64" },
    { name: "f32", type: "f32" },
    { name: "f64", type: "f64" },
    { name: "string", type: "string", size: 16 },
  ] as const satisfies RelateRules;

  type Test = Expect<
    Equal<
      RelatedObject<typeof rules>,
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
  >;
});

Deno.test("decode, estimate nesting", () => {
  assertEquals(true, true);
  const point = [
    { name: "x", type: "u8" },
    { name: "y", type: "u8" },
  ] as const satisfies RelateRules;

  const rules = [
    { name: "start", type: "object", of: point },
    { name: "end", type: "object", of: point },
  ] as const satisfies RelateRules;

  type Test = Expect<
    Equal<
      RelatedObject<typeof rules>,
      {
        start: { x: number; y: number };
        end: { x: number; y: number };
      }
    >
  >;
});
