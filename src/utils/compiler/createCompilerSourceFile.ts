import {ts, ScriptTarget} from "../../typescript";

export function createCompilerSourceFile(filePath: string, text: string, scriptTarget: ScriptTarget | undefined) {
    return ts.createSourceFile(filePath, text, scriptTarget == null ? ScriptTarget.Latest : scriptTarget, true);
}
