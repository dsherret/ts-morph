/* barrel:ignore */
import * as errors from "../../errors";
import {SourceFile} from "../../compiler";
import {createCompilerSourceFile} from "../../utils";
import {NodeHandler} from "../nodeHandlers";
import {TextManipulator} from "../textManipulators";

export function doManipulation(sourceFile: SourceFile, textManipulator: TextManipulator, nodeHandler: NodeHandler) {
    const newFileText = textManipulator.getNewText(sourceFile.getFullText());
    try {
        const replacementSourceFile = createCompilerSourceFile(sourceFile.getFilePath(), newFileText, sourceFile.global.manipulationSettings.getScriptTarget());
        nodeHandler.handleNode(sourceFile, replacementSourceFile, replacementSourceFile);
    } catch (err) {
        throw new errors.InvalidOperationError(err.message + "\n" +
            `-- Details --\n` +
            `Path: ${sourceFile.getFilePath()}\n` +
            `Text: ${textManipulator.getTextForError(newFileText)}`
        );
    }
}
