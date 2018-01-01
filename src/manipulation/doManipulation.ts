/* barrel:ignore */
import {SourceFile} from "./../compiler";
import {NodeHandler} from "./nodeHandlers";
import {TextManipulator} from "./textManipulators";

export function doManipulation(sourceFile: SourceFile, textManipulator: TextManipulator, nodeHandler: NodeHandler) {
    const newFileText = textManipulator.getNewText(sourceFile.getFullText());
    const replacementSourceFile = sourceFile.global.compilerFactory.createTempSourceFileFromText(newFileText, { filePath: sourceFile.getFilePath() });
    nodeHandler.handleNode(sourceFile, replacementSourceFile);
}
