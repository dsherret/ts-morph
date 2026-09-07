import { runtime } from "../runtimes";
import { FileUtils } from "./FileUtils";

/** Checks the specified file paths to see if the match any of the specified patterns. */
export function matchGlobs(paths: ReadonlyArray<string>, patterns: string | ReadonlyArray<string>, cwd: string) {
  if (typeof patterns === "string")
    patterns = [FileUtils.toAbsoluteGlob(patterns, cwd)];
  else
    patterns = patterns.map(p => FileUtils.toAbsoluteGlob(p, cwd));

  // adapted from multimatch, but more efficient: https://github.com/sindresorhus/multimatch/blob/main/index.js
  // (a set rather than an array so that a project's worth of paths is not scanned per match)
  const result = new Set<string>();
  for (const path of paths) {
    for (let pattern of patterns) {
      let isNegated = false;

      if (FileUtils.isNegatedGlob(pattern)) {
        isNegated = true;
        pattern = pattern.slice(1);
      }

      if (runtime.getPathMatchesPattern(path, pattern)) {
        if (isNegated)
          result.delete(path);
        else
          result.add(path);
      }
    }
  }

  return Array.from(result);
}
