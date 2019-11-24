import { ts, ScriptKind, ScriptTarget } from "../typescript";
import { StandardizedFilePath } from "../fileSystem";

export function createCompilerSourceFile(
    filePath: StandardizedFilePath,
    scriptSnapshot: ts.IScriptSnapshot,
    scriptTarget: ts.ScriptTarget | undefined,
    version: string,
    setParentNodes: boolean,
    scriptKind: ScriptKind | undefined
) {
    return ts.createLanguageServiceSourceFile(
        filePath,
        scriptSnapshot,
        scriptTarget ?? ScriptTarget.Latest,
        version,
        setParentNodes,
        scriptKind
    );
}
