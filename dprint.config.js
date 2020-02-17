// @ts-check
const { TypeScriptPlugin } = require("dprint-plugin-typescript");
const { JsoncPlugin } = require("dprint-plugin-jsonc");

/** @type { import("dprint").Configuration } */
module.exports.config = {
    projectType: "openSource",
    lineWidth: 160,
    plugins: [
        new TypeScriptPlugin({
            useBraces: "preferNone",
            singleBodyPosition: "nextLine",
            preferHanging: true,
            nextControlFlowPosition: "nextLine",
            "arrowFunctionExpression.useParentheses": "preferNone",
            "tryStatement.nextControlFlowPosition": "sameLine",
            quoteStyle: "alwaysDouble"
        }),
        new JsoncPlugin({
            indentWidth: 2
        })
    ],
    includes: [
        "**/*{.ts,.json,.js}"
    ],
    excludes: [
        "packages/*/dist/**/*.*",
        "packages/*/lib/*.ts"
    ]
};
