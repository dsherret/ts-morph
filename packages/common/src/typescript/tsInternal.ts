import { ModuleKind, ModuleResolutionKind, ScriptTarget, ts } from "./public";

/**
 * Resolves the module resolution kind the compiler will actually use for the
 * given options.
 *
 * This mirrors `CompilerOptions.GetModuleResolutionKind` in
 * `internal/core/compileroptions.go`. It used to be `ts.getEmitModuleResolutionKind`
 * from the `typescript` package, which tsgo does not expose to JS, so it is
 * reimplemented here — it is a small pure function of the options.
 */
export function getEmitModuleResolutionKind(compilerOptions: ts.CompilerOptions): ModuleResolutionKind {
  switch (compilerOptions.moduleResolution) {
    case undefined:
    case ModuleResolutionKind.Unknown:
    case ModuleResolutionKind.Classic:
    case ModuleResolutionKind.Node10:
      switch (getEmitModuleKind(compilerOptions)) {
        case ModuleKind.Node16:
        case ModuleKind.Node18:
        case ModuleKind.Node20:
          return ModuleResolutionKind.Node16;
        case ModuleKind.NodeNext:
          return ModuleResolutionKind.NodeNext;
        default:
          return ModuleResolutionKind.Bundler;
      }
    default:
      return compilerOptions.moduleResolution;
  }
}

/**
 * Resolves the script target the compiler will actually use for the given options.
 *
 * Mirrors `CompilerOptions.GetEmitScriptTarget`, whose no-target fallback is
 * `ScriptTargetLatestStandard` (ES2025).
 */
export function getEmitScriptTarget(compilerOptions: ts.CompilerOptions): ScriptTarget {
  // `ScriptTargetNone` is 0 and is not part of the generated ScriptTarget enum
  return compilerOptions.target == null || (compilerOptions.target as number) === 0
    ? ScriptTarget.ES2025
    : compilerOptions.target;
}

/**
 * Resolves the script target source files are parsed at for the given options.
 *
 * This is deliberately not `getEmitScriptTarget`: the compiler's *emit* target
 * falls back to ES2025, but ts-morph has always parsed at `ScriptTarget.Latest`
 * when no target is configured, and that is the value `SourceFile#getLanguageVersion`
 * reports.
 */
export function getParseScriptTarget(compilerOptions: ts.CompilerOptions): ScriptTarget {
  // `ScriptTargetNone` is 0 and is not part of the generated ScriptTarget enum
  return compilerOptions.target == null || (compilerOptions.target as number) === 0
    ? ScriptTarget.Latest
    : compilerOptions.target;
}

/** Mirrors `CompilerOptions.GetEmitModuleKind`. */
function getEmitModuleKind(compilerOptions: ts.CompilerOptions): ModuleKind {
  if (compilerOptions.module != null && compilerOptions.module !== ModuleKind.None)
    return compilerOptions.module;

  const target = getEmitScriptTarget(compilerOptions);
  if (target === ScriptTarget.ESNext)
    return ModuleKind.ESNext;
  if (target >= ScriptTarget.ES2022)
    return ModuleKind.ES2022;
  if (target >= ScriptTarget.ES2020)
    return ModuleKind.ES2020;
  if (target >= ScriptTarget.ES2015)
    return ModuleKind.ES2015;
  return ModuleKind.CommonJS;
}
