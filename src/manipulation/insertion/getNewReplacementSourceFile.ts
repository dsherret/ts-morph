import {Node, SourceFile} from "./../../compiler";

export interface GetNewReplacementSourceFileOptions {
    insertPos: number;
    newText: string;
    sourceFile: SourceFile;
}

export function getNewReplacementSourceFile(opts: GetNewReplacementSourceFileOptions) {
    const {insertPos, newText, sourceFile} = opts;
    const currentText = sourceFile.getFullText();
    const newFileText = currentText.substring(0, insertPos) + newText + currentText.substring(insertPos);

    return sourceFile.global.compilerFactory.createTempSourceFileFromText(newFileText, sourceFile.getFilePath());
}
