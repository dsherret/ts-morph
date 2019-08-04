/* barrel:ignore */
import { SourceFile } from "../../compiler";
import * as errors from "../../errors";
import { NodeHandler } from "../nodeHandlers";
import { TextManipulator } from "../textManipulators";

export function doManipulation(sourceFile: SourceFile, textManipulator: TextManipulator, nodeHandler: NodeHandler, newFilePath?: string) {
    sourceFile._firePreModified();
    const newFileText = textManipulator.getNewText(sourceFile.getFullText());
    try {
        const replacementSourceFile = sourceFile._context.compilerFactory.createCompilerSourceFileFromText(
            newFilePath || sourceFile.getFilePath(),
            newFileText,
            sourceFile.getScriptKind()
        );
        nodeHandler.handleNode(sourceFile, replacementSourceFile, replacementSourceFile);
    } catch (err) {
        throw new errors.InvalidOperationError(err.message + "\n"
            + `-- Details --\n`
            + `Path: ${sourceFile.getFilePath()}\n`
            + `Text: ${JSON.stringify(textManipulator.getTextForError(newFileText))}\n`
            + `Stack: ${err.stack}`);
    }
}
