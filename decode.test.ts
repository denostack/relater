import { assertEquals, assertIsError } from "assert/mod.ts";

import { decode } from "./decode.ts";
import { RelateRule, StringTransformer } from "./types.ts";

const textDecoder = new TextDecoder();
const textEncoder = new TextEncoder();

export const CustomStringTransformer: StringTransformer = {
  encode: (value: string) => textEncoder.encode(value).map((v) => v + 1),
  decode: (bytes: Uint8Array) => {
    const found = bytes.findIndex((v) => v === 0);
    return textDecoder.decode(bytes.map((v) => v - 1).slice(0, found));
  },
};

Deno.test("decode, decode simple types", () => {
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
    0, // dangling
    0,
    0,
  ]);
  const obj = decode(buffer.buffer, rules);
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

Deno.test("decode, decode array types", () => {
  const rules = {
    type: "array",
    of: { type: "i32" },
    size: 2,
  } as const satisfies RelateRule;

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
  const items = decode(buffer.buffer, rules);
  assertEquals(items, [1, 2]);
});

Deno.test("decode, decode array types with error", () => {
  const rules = {
    type: "array",
    of: { type: "i32" },
    size: 3,
  } as const satisfies RelateRule;

  const buffer = new Uint8Array([
    0,
  ]);

  try {
    decode(buffer.buffer, rules);
  } catch (e) {
    assertIsError(
      e,
      RangeError,
      "Offset is outside the bounds of the DataView",
    );
  }
});

Deno.test("decode, transform string", () => {
  const textDecoder = new TextDecoder();
  const charOffset = "A".charCodeAt(0);
  const rules = {
    type: "object",
    of: [
      {
        name: "string",
        type: "string",
        size: 8,
        transformer: {
          decode: (value) =>
            textDecoder.decode(value.map((v) => v + charOffset)),
          encode: () => {
            throw new Error("never called");
          },
        },
      },
    ],
  } as const satisfies RelateRule;

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
  const item = decode(buffer.buffer, rules);

  assertEquals(item, { string: "ABCDEFGH" });
});

Deno.test("decode, nest types", () => {
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
      {
        name: "name",
        type: "string",
        size: 8,
        transformer: CustomStringTransformer,
      },
      { name: "start", ...point },
      { name: "end", ...point },
    ],
  } as const satisfies RelateRule;

  const buffer = new Uint8Array([
    49,
    50,
    51,
    52,
    53,
    54,
    55,
    0,
    0,
    1,
    2,
    3,
  ]);
  const obj = decode(buffer.buffer, rules);
  assertEquals(obj, {
    name: "0123456",
    start: { x: 0, y: 1 },
    end: { x: 2, y: 3 },
  });
});
