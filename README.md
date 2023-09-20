# relater <a href="https://github.com/denostack"><img src="https://raw.githubusercontent.com/denostack/images/main/logo.svg" width="160" align="right" /></a>

Relater seamlessly maps ArrayBuffer content to user-defined objects.

<p>
  <a href="https://github.com/denostack/relater/actions"><img alt="Build" src="https://img.shields.io/github/actions/workflow/status/denostack/relater/ci.yml?branch=main&logo=github&style=flat-square" /></a>
  <a href="https://codecov.io/gh/denostack/relater"><img alt="Coverage" src="https://img.shields.io/codecov/c/gh/denostack/relater?style=flat-square" /></a>
  <img alt="License" src="https://img.shields.io/npm/l/relater.svg?style=flat-square" />
  <img alt="Language Typescript" src="https://img.shields.io/badge/language-Typescript-007acc.svg?style=flat-square" />
  <br />
  <a href="https://deno.land/x/relater"><img alt="deno.land/x/relater" src="https://img.shields.io/badge/dynamic/json?url=https://api.github.com/repos/denostack/relater/tags&query=$[0].name&display_name=tag&label=deno.land/x/relater@&style=flat-square&logo=deno&labelColor=000&color=777" /></a>
  <a href="https://www.npmjs.com/package/relater"><img alt="Version" src="https://img.shields.io/npm/v/relater.svg?style=flat-square&logo=npm" /></a>
  <a href="https://npmcharts.com/compare/relater?minimal=true"><img alt="Downloads" src="https://img.shields.io/npm/dt/relater.svg?style=flat-square" /></a>
</p>

## Usage

### with Deno

```ts
import { Relater } from "https://deno.land/x/relater/mod.ts";

const relater = new Relater(
  {
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
  } as const satisfies RelateRule,
);

const buffer = new Uint8Array([/* ... */]);
// decode
const value = relater.decode(buffer.buffer);

console.log(value); // { i8: 0, u8: 0, i32: 0, u32: 0, i64: 0n, u64: 0n }

value.i8 = 1;
value.u8 = 2;

// encode
const encoded = relater.encode(value);

console.log(encoded); // Uint8Array(8) [ 1, 2, ... ]
```

### with Node.js & Browser

**Install**

```bash
npm install relater
```

```ts
import { Relater } from "relater";

// Usage is as above :-)
```

## Supported Types

| Type     | JavaScript Equivalent | Description                             |
| -------- | --------------------- | --------------------------------------- |
| `f64`    | `number`              | 64-bit floating point number            |
| `f32`    | `number`              | 32-bit floating point number            |
| `i64`    | `bigint`              | 64-bit signed integer                   |
| `u64`    | `bigint`              | 64-bit unsigned integer                 |
| `i32`    | `number`              | 32-bit signed integer                   |
| `u32`    | `number`              | 32-bit unsigned integer                 |
| `i16`    | `number`              | 16-bit signed integer                   |
| `u16`    | `number`              | 16-bit unsigned integer                 |
| `i8`     | `number`              | 8-bit signed integer                    |
| `u8`     | `number`              | 8-bit unsigned integer                  |
| `string` | `string`              | String type (length is based on buffer) |
| `object` | `object`              | Object type                             |
| `array`  | `Array`               | Array type                              |
