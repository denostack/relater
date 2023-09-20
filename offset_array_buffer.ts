export class OffsetArrayBuffer {
  raw: ArrayBuffer;
  offset: number;

  constructor(raw: ArrayBuffer, offset = 0) {
    this.raw = raw;
    this.offset = offset;
  }
}
