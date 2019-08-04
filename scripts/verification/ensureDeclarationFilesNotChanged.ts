/*
 * This script ensures the declaration files outputted when publishing the library matches the ones expected in the lib folder.
 *
 * This ensures that the library is not released without reviewing and approving the changes.
 * Run `yarn overwrite-declaration-files` to approve the changes.
 */

import * as fs from "fs";
import * as jsdiff from "diff";
import chalk from "chalk";

(async function doCheck() {
    await Promise.all([
        compareFiles("./lib/ts-morph.d.ts", "./dist-declarations/ts-morph.d.ts"),
        compareFiles("./lib/code-block-writer.d.ts", "./dist-declarations/code-block-writer.d.ts")
    ]);
})();

async function compareFiles(baseLineFilePath: string, outputtedFilePath: string) {
    const baselineFilePromise = readFile(baseLineFilePath);
    const outputtedFilePromise = readFile(outputtedFilePath);

    const baseLineResult = await baselineFilePromise;
    const outputtedFileResult = await outputtedFilePromise;

    const results = jsdiff.diffTrimmedLines(baseLineResult, outputtedFileResult).filter(result => result.added || result.removed);
    if (results.length > 0) {
        console.log(`There were differences in the declaration file (${outputtedFilePath}). `
            + "Please review these changes and then confirm them by running `yarn overwrite-declaration-files`.");
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
