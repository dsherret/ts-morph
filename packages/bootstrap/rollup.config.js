import typescript from "rollup-plugin-typescript2";
const isDeno = process.env.BUILD === "deno";
const outputFolder = isDeno ? "./dist-deno" : "./dist";
const moduleKind = isDeno ? "es" : "cjs";

export default {
    input: "./src/index.ts",
    external: [],
    output: {
        file: outputFolder + "/ts-morph-bootstrap.js",
        format: moduleKind,
    },
    plugins: [
        typescript({
            tsconfig: "tsconfig.rollup.json",
        }),
    ],
};
