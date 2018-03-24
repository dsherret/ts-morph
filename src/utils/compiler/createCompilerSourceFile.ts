import {ts, ScriptTarget} from "../../typescript";

export function createCompilerSourceFile(filePath: string, text: string, scriptTarget: ScriptTarget) {
    return ts.createSourceFile(filePath, text, scriptTarget, true);
}
