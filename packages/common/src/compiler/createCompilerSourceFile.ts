import { ts, ScriptKind, ScriptTarget } from "../typescript";

export function createCompilerSourceFile(
    filePath: string,
    scriptSnapshot: ts.IScriptSnapshot,
    scriptTarget: ts.ScriptTarget | undefined,
    version: string,
    scriptKind: ScriptKind | undefined
) {
    return ts.createLanguageServiceSourceFile(
        filePath,
        scriptSnapshot,
        scriptTarget ?? ScriptTarget.Latest,
        version,
        true,
        scriptKind
    );
}
