import typescript from "rollup-plugin-typescript2";

export default {
    input: "./src/main.ts",
    external: [
        "code-block-writer",
        "@dsherret/to-absolute-glob"
    ],
    output: {
        file: "./dist/ts-morph.js",
        format: "cjs"
    },
    plugins: [
        typescript({
            typescript: require("ttypescript"),
            tsconfig: "tsconfig.rollup.json"
        })
    ]
}
