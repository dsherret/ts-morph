import {SourceFile, RenameLocation} from "./../../compiler";
import {Logger} from "./../../utils";
import {replaceTreeForgettingChangedNodes} from "./../tree";

export function replaceSourceFileTextForRename(opts: { sourceFile: SourceFile; renameLocations: RenameLocation[]; newName: string; }) {
    const {sourceFile, renameLocations, newName} = opts;
    const fullText = sourceFile.getFullText();
    let newFileText = fullText;
    let difference = 0;

    for (const textSpan of renameLocations.map(l => l.getTextSpan())) {
        let start = textSpan.getStart();
        let end = start + textSpan.getLength();
        start -= difference;
        end -= difference;
        newFileText = newFileText.substring(0, start) + newName + newFileText.substring(end);
        difference += textSpan.getLength() - newName.length;
    }

    const tempSourceFile = sourceFile.global.compilerFactory.createTempSourceFileFromText(newFileText, { filePath: sourceFile.getFilePath() });

    try {
        replaceTreeForgettingChangedNodes(sourceFile, tempSourceFile);
    } catch (ex) {
        Logger.warn("Could not replace tree, so forgetting all nodes instead. Message: " + ex);
        // forget all the source file's nodes
        sourceFile.getChildSyntaxListOrThrow().forget();
        // replace the source file with the temporary source file
        sourceFile.global.compilerFactory.replaceCompilerNode(sourceFile, tempSourceFile.compilerNode);
    }
}
