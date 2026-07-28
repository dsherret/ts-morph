import { tsgo } from "../rollupPluginTsgo.mjs";

const emitDir = "./dist-rollup";
const isDeno = process.env.BUILD === "deno";
const outputFolder = isDeno ? "./dist-deno" : "./dist";
const moduleKind = isDeno ? "es" : "cjs";

export default {
  input: emitDir + "/main.js",
  external: [
    "code-block-writer",
    "@ts-morph/common",
  ],
  output: {
    file: outputFolder + "/ts-morph.js",
    format: moduleKind,
    interop: "compat",
  },
  plugins: [
    tsgo({ tsconfig: "tsconfig.rollup.json", emitDir }),
  ],
};
