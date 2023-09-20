import { StringTransformer } from "./types.ts";

const textDecoder = new TextDecoder();
const textEncoder = new TextEncoder();

export const defaultStringTransformer: StringTransformer = {
  encode: (value: string) => textEncoder.encode(value),
  decode: (bytes: Uint8Array) => {
    const found = bytes.findIndex((v) => v === 0);
    return textDecoder.decode(bytes.slice(0, found));
  },
};
