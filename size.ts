import { RelateRule } from "./types.ts";

export function getSize(rule: RelateRule): number {
  switch (rule.type) {
    case "f64":
    case "i64":
    case "u64":
      return 8;
    case "f32":
    case "i32":
    case "u32":
      return 4;
    case "i16":
    case "u16":
      return 2;
    case "i8":
    case "u8":
      return 1;
    case "string":
      return rule.size;
    case "object": {
      let size = 0;
      for (const nextRule of rule.of) {
        size += getSize(nextRule);
      }
      return size;
    }
    case "array": {
      return getSize(rule.of) * rule.size;
    }
  }
  return 0;
}
