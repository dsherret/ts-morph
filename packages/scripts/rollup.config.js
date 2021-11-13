import typescript from "rollup-plugin-typescript2";

export default {
    input: "./src/index.ts",
    external: [],
    output: {
        file: "./dist/ts-morph-scripts.js",
        format: "cjs",
    },
    plugins: [
        typescript({
            tsconfig: "tsconfig.rollup.json",
        }),
    ],
};
