import { build, emptyDir } from "dnt/mod.ts";
import { bgGreen } from "fmt/colors.ts";

const denoInfo = JSON.parse(
  Deno.readTextFileSync(new URL("../deno.json", import.meta.url)),
);
const version = denoInfo.version;

console.log(bgGreen(`version: ${version}`));

await emptyDir("./.npm");

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./.npm",
  shims: {
    deno: false,
  },
  test: false,
  compilerOptions: {
    lib: ["ES2021", "DOM"],
  },
  package: {
    name: "relater",
    version,
    description:
      "Relater seamlessly maps ArrayBuffer content to user-defined objects.",
    keywords: [
      "arraybuffer",
      "mapping",
      "object-relational",
      "buffer",
      "type-mapping",
      "data-conversion",
      "typescript",
    ],
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/denostack/relater.git",
    },
    bugs: {
      url: "https://github.com/denostack/relater/issues",
    },
  },
});

// post build steps
Deno.copyFileSync("README.md", ".npm/README.md");
