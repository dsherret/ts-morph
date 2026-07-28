import { tsgo } from "../rollupPluginTsgo.mjs";

const emitDir = "./dist-rollup";
const isDeno = process.env.BUILD === "deno";
const outputFolder = isDeno ? "./dist-deno" : "./dist";
const moduleKind = isDeno ? "es" : "cjs";

export default {
  input: emitDir + "/index.js",
  external: [],
  output: {
    file: outputFolder + "/ts-morph-bootstrap.js",
    format: moduleKind,
    interop: "compat",
  },
  plugins: [
    tsgo({ tsconfig: "tsconfig.rollup.json", emitDir }),
  ],
};
