import type { Equal, Expect } from "@type-challenges/utils";
import { assertEquals } from "assert/mod.ts";

import { Relater } from "./relater.ts";

Deno.test("Relater, get related values", () => {
  const relater = new Relater(
    [
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
    ] as const,
  );

  const buffer = new Uint8Array([
    255,
    255,
    255,
    254,
    255,
    254,
    255,
    255,
    255,
    253,
    255,
    255,
    255,
    253,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    252,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    252,
    64,
    72,
    245,
    195,
    64,
    9,
    33,
    250,
    252,
    139,
    0,
    122,
    104,
    101,
    108,
    108,
    111,
    32,
    119,
    111,
    114,
    108,
    100,
    33,
    0,
    0,
    0,
    0,
  ]);
  const obj = relater.relate(buffer.buffer);
  assertEquals(obj, {
    i8: -1,
    u8: 255,
    i16: -2,
    u16: 65534,
    i32: -3,
    u32: 4294967293,
    i64: -4n,
    u64: 18446744073709551612n,
    f32: 3.140000104904175,
    f64: 3.141592,
    string: "hello world!",
  });

  type Test = Expect<
    Equal<
      typeof obj,
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

Deno.test("Relater, set related values", () => {
  const relater = new Relater(
    [
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
    ] as const,
  );

  const buffer = new Uint8Array(58);
  const obj = relater.relate(buffer.buffer);

  // Set!
  Object.assign(obj, {
    i8: -1,
    u8: 255,
    i16: -2,
    u16: 65534,
    i32: -3,
    u32: 4294967293,
    i64: -4n,
    u64: 18446744073709551612n,
    f32: 3.14,
    f64: 3.141592,
    string: "hello world!",
  });

  assertEquals(
    buffer,
    new Uint8Array([
      255,
      255,
      255,
      254,
      255,
      254,
      255,
      255,
      255,
      253,
      255,
      255,
      255,
      253,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      252,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      252,
      64,
      72,
      245,
      195,
      64,
      9,
      33,
      250,
      252,
      139,
      0,
      122,
      104,
      101,
      108,
      108,
      111,
      32,
      119,
      111,
      114,
      108,
      100,
      33,
      0,
      0,
      0,
      0,
    ]),
  );
});
