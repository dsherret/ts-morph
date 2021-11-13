import typescript from "rollup-plugin-typescript2";
const isDeno = process.env.BUILD === "deno";
const outputFolder = isDeno ? "./dist-deno" : "./dist";
const moduleKind = isDeno ? "es" : "cjs";

export default {
  input: "./src/main.ts",
  external: [
    "code-block-writer",
    "@ts-morph/common",
  ],
  output: {
    file: outputFolder + "/ts-morph.js",
    format: moduleKind,
  },
  plugins: [
    typescript({
      tsconfig: "tsconfig.rollup.json",
    }),
  ],
};
