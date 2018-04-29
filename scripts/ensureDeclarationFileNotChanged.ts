/*
 * This script ensures the declaration file outputted when publishing the library matches the one expected in the lib folder.
 *
 * This ensures that the library is not released without reviewing and approving the changes (run `npm run overwrite-declaration-file` to approve the changes).
 */

import * as fs from "fs";
import * as jsdiff from "diff";
import chalk from "chalk";

(async function doCheck() {
    await Promise.all([
        compareFiles("./lib/ts-simple-ast.d.ts", "./dist/main.d.ts"),
        compareFiles("./lib/typescript/typescript.d.ts", "./dist/typescript/typescript.d.ts"),
        compareFiles("./lib/codeBlockWriter/code-block-writer.d.ts", "./dist/codeBlockWriter/code-block-writer.d.ts")
    ]);
})();

async function compareFiles(baseLineFilePath: string, outputtedFilePath: string) {
    const baselineFilePromise = readFile(baseLineFilePath);
    const outputtedFilePromise = readFile(outputtedFilePath);

    const baseLineResult = await baselineFilePromise;
    const outputtedFileResult = await outputtedFilePromise;

    const results = jsdiff.diffLines(baseLineResult, outputtedFileResult).filter(result => result.added || result.removed);
    if (results.length > 0) {
        console.log(`There were differences in the declaration file (${outputtedFilePath}). ` +
            "Please review these changes and then confirm them by running `npm run overwrite-declaration-file`.");
        for (const result of results) {
            const text = result.added ? chalk.green(result.value) : chalk.red(result.value);
            console.log(text);
        }
        process.exit(1);
    }
}

async function readFile(filePath: string) {
    return new Promise<string>((resolve, reject) => {
        fs.readFile(filePath, "utf-8", (err, data) => {
            if (err)
                reject(err);
            else
                resolve(data);
        });
    });
}
