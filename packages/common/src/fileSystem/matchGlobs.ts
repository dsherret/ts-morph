import multimatch from "multimatch";
import { FileUtils } from "./FileUtils";

/** Checks the specified file paths to see if the match any of the specified patterns. */
export function matchGlobs(paths: ReadonlyArray<string>, patterns: ReadonlyArray<string> | string, cwd: string) {
    if (typeof patterns === "string")
        patterns = FileUtils.toAbsoluteGlob(patterns, cwd);
    else
        patterns = patterns.map(p => FileUtils.toAbsoluteGlob(p, cwd));

    // @types/multimatch incorrectly specifies `string[]` type despite not modifying the array
    return multimatch(paths as string[], patterns as string[]);
}
