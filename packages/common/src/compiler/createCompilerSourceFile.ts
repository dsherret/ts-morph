import { StandardizedFilePath } from "../fileSystem";
import { ScriptKind, ts } from "../typescript";

export function createCompilerSourceFile(
  filePath: StandardizedFilePath,
  scriptSnapshot: ts.IScriptSnapshot,
  optionsOrScriptTarget: ts.ScriptTarget | ts.CreateSourceFileOptions | undefined,
  version: string,
  setParentNodes: boolean,
  scriptKind: ScriptKind | undefined,
) {
  return ts.createLanguageServiceSourceFile(
    filePath,
    scriptSnapshot,
    optionsOrScriptTarget ?? ts.ScriptTarget.Latest,
    version,
    setParentNodes,
    scriptKind,
  );
}
