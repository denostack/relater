import { assertEquals } from "assert/mod.ts";

import { encode } from "./encode.ts";
import { RelateRule } from "./types.ts";

Deno.test("encode, encode simple types", () => {
  const rules = {
    type: "object",
    of: [
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
    ],
  } as const satisfies RelateRule;

  const encoded = encode({
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
  }, rules);

  assertEquals(
    new Uint8Array(encoded),
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

Deno.test("encode, encode array types", () => {
  const rules = {
    type: "array",
    of: { type: "i32" },
    size: 2,
  } as const satisfies RelateRule;

  const encoded = encode([1, 2, 3 /* dangling */], rules);
  assertEquals(
    new Uint8Array(encoded),
    new Uint8Array([
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      2,
    ]),
  );
});

Deno.test("encode, encode array types with less items", () => {
  const rules = {
    type: "array",
    of: { type: "i32" },
    size: 3,
  } as const satisfies RelateRule;

  const encoded = encode([1], rules);
  assertEquals(
    new Uint8Array(encoded),
    new Uint8Array([
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
    ]),
  );
});

Deno.test("encode, transform string", () => {
  const textEncoder = new TextEncoder();
  const charOffset = "A".charCodeAt(0);
  const rules = {
    type: "object",
    of: [
      {
        name: "string",
        type: "string",
        size: 8,
        transformer: {
          decode: () => {
            throw new Error("never called");
          },
          encode: (value) =>
            textEncoder.encode(value).map((v) => v - charOffset),
        },
      },
    ],
  } as const satisfies RelateRule;

  assertEquals(
    new Uint8Array(encode({ string: "ABCDEFGH" }, rules)),
    new Uint8Array([
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
    ]),
  );

  assertEquals(
    new Uint8Array(encode({ string: "AB" }, rules)), // shorter than size
    new Uint8Array([
      0,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
    ]),
  );

  assertEquals(
    new Uint8Array(encode({ string: "ABCDEFGHIJKLMNOP" }, rules)), // longer than size
    new Uint8Array([
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
    ]),
  );
});

Deno.test("encode, nest types", () => {
  const point = {
    type: "object",
    of: [
      { name: "x", type: "u8" },
      { name: "y", type: "u8" },
    ],
  } as const satisfies RelateRule;

  const rules = {
    type: "object",
    of: [
      { name: "start", ...point },
      { name: "end", ...point },
    ],
  } as const satisfies RelateRule;

  const encoded = encode({
    start: { x: 0, y: 1 },
    end: { x: 2, y: 3 },
  }, rules);
  assertEquals(
    new Uint8Array(encoded),
    new Uint8Array([
      0,
      1,
      2,
      3,
    ]),
  );
});
