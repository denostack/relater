import { assertEquals } from "assert/mod.ts";

import { decode, decodeMany } from "./decode.ts";
import { RelateRules } from "./types.ts";

Deno.test("decode, decode simple types", () => {
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
  const obj = decode(rules, buffer.buffer);
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
});

Deno.test("decode, decode many items", () => {
  const rules = [
    { name: "i32", type: "i32" },
  ] as const satisfies RelateRules;

  const buffer = new Uint8Array([
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    2,
    0, // dangling
    0,
    0,
  ]);
  const items = decodeMany(rules, buffer.buffer);
  assertEquals(items, [{ i32: 1 }, { i32: 2 }]);
});

Deno.test("decode, decode many items with limit", () => {
  const rules = [
    { name: "i32", type: "i32" },
  ] as const satisfies RelateRules;

  const buffer = new Uint8Array([
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
  ]);
  const items = decodeMany(rules, buffer.buffer, { limit: 1 });
  assertEquals(items, [{ i32: 1 }]);
});

Deno.test("decode, relateMany with offset", () => {
  const rules = [
    { name: "i32", type: "i32" },
  ] as const satisfies RelateRules;

  const buffer = new Uint8Array([
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    2,
  ]);
  const items = decodeMany(rules, buffer.buffer, { offset: 3 });
  assertEquals(items, [{ i32: 1 }, { i32: 2 }]);
});

Deno.test("decode, transform string", () => {
  const textEncoder = new TextEncoder();
  const textDecoder = new TextDecoder();
  const charOffset = "A".charCodeAt(0);
  const rules = [
    {
      name: "string",
      type: "string",
      size: 8,
      transformer: {
        decode: (value) => textDecoder.decode(value.map((v) => v + charOffset)),
        encode: (value) => textEncoder.encode(value).map((v) => v - charOffset),
      },
    },
  ] as const satisfies RelateRules;

  const buffer = new Uint8Array([
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
  ]);
  const item = decode(rules, buffer.buffer);

  assertEquals(item, { string: "ABCDEFGH" });
});

Deno.test("decode, nest types", () => {
  const point = [
    { name: "x", type: "u8" },
    { name: "y", type: "u8" },
  ] as const satisfies RelateRules;

  const rules = [
    { name: "start", type: "object", of: point },
    { name: "end", type: "object", of: point },
  ] as const satisfies RelateRules;

  const buffer = new Uint8Array([
    0,
    1,
    2,
    3,
  ]);
  const obj = decode(rules, buffer.buffer);
  assertEquals(obj, {
    start: { x: 0, y: 1 },
    end: { x: 2, y: 3 },
  });
});
