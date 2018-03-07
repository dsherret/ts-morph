import * as toAbsoluteGlob from "@dsherret/to-absolute-glob";
import * as multimatch from "multimatch";

export function matchGlobs(paths: string[], patterns: string[] | string, cwd: string) {
    if (typeof patterns === "string")
        patterns = toAbsoluteGlob(patterns, { cwd });
    else
        patterns = patterns.map(p => toAbsoluteGlob(p, { cwd }));
    return multimatch(paths, patterns);
}
