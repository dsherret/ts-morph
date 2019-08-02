import * as multimatch from "multimatch";
import { FileUtils } from "./FileUtils";

export function matchGlobs(paths: ReadonlyArray<string>, patterns: ReadonlyArray<string> | string, cwd: string) {
    if (typeof patterns === "string")
        patterns = FileUtils.toAbsoluteGlob(patterns, cwd);
    else
        patterns = patterns.map(p => FileUtils.toAbsoluteGlob(p, cwd));

    // @types/multimatch incorrectly specifies `string[]` type despite not modifying the array
    return multimatch(paths as string[], patterns as string[]);
}
