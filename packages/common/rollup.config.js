import typescript from "rollup-plugin-typescript2";

export default [{
    input: ["./src/index.ts"],
    external: [
        "@dsherret/to-absolute-glob"
    ],
    output: {
        file: "./dist/ts-morph-common.js",
        format: "cjs"
    },
    plugins: [
        typescript({
            typescript: require("ttypescript"),
            tsconfig: "tsconfig.rollup.json"
        })
    ]
}, {
    input: ["./src/data/libFiles.ts"],
    output: {
        file: "./dist/data/libFiles.js",
        format: "cjs"
    },
    plugins: [
        typescript({
            typescript: require("ttypescript"),
            tsconfig: "tsconfig.rollup.json"
        })
    ]
}];
