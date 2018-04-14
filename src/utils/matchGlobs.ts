import * as multimatch from "multimatch";
import { FileUtils } from "./FileUtils";

export function matchGlobs(paths: string[], patterns: string[] | string, cwd: string) {
    if (typeof patterns === "string")
        patterns = FileUtils.toAbsoluteGlob(patterns, cwd);
    else
        patterns = patterns.map(p => FileUtils.toAbsoluteGlob(p, cwd));
    return multimatch(paths, patterns);
}
