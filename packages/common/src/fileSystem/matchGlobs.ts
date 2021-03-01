import { runtime } from "../runtimes";
import { FileUtils } from "./FileUtils";

/** Checks the specified file paths to see if the match any of the specified patterns. */
export function matchGlobs(paths: ReadonlyArray<string>, patterns: string | ReadonlyArray<string>, cwd: string) {
    if (typeof patterns === "string")
        patterns = [FileUtils.toAbsoluteGlob(patterns, cwd)];
    else
        patterns = patterns.map(p => FileUtils.toAbsoluteGlob(p, cwd));

    // adapted from multimatch, but more efficient: https://github.com/sindresorhus/multimatch/blob/main/index.js
    const result: string[] = [];
    for (const path of paths) {
        for (let pattern of patterns) {
            let process = addArray;

            if (FileUtils.isNegatedGlob(pattern)) {
                process = removeArray;
                pattern = pattern.slice(1);
            }

            if (runtime.getPathMatchesPattern(path, pattern))
                process(result, path);
        }
    }

    return result;
}

function addArray(items: string[], newItem: string) {
    if (items.indexOf(newItem) === -1)
        items.push(newItem);
}

function removeArray(items: string[], removeItem: string) {
    const index = items.indexOf(removeItem);
    if (index >= 0)
        items.splice(index, 1);
}
