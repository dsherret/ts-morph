import { StandardizedFilePath } from "../fileSystem";
import { ScriptKind, ScriptTarget, ts } from "../typescript";

export function createCompilerSourceFile(
  filePath: StandardizedFilePath,
  scriptSnapshot: ts.IScriptSnapshot,
  scriptTarget: ts.ScriptTarget | undefined,
  version: string,
  setParentNodes: boolean,
  scriptKind: ScriptKind | undefined,
) {
  return ts.createLanguageServiceSourceFile(
    filePath,
    scriptSnapshot,
    scriptTarget ?? ScriptTarget.Latest,
    version,
    setParentNodes,
    scriptKind,
  );
}
