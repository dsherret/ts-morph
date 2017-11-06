import {Node, SourceFile} from "./../compiler";

export interface GetNewReplacementSourceFileOptions {
    insertPos: number;
    newText: string;
    sourceFile: SourceFile;
    replacingLength?: number;
}

export function getNewReplacementSourceFile(opts: GetNewReplacementSourceFileOptions) {
    const {insertPos, newText, sourceFile, replacingLength = 0} = opts;
    const currentText = sourceFile.getFullText();
    const newFileText = currentText.substring(0, insertPos) + newText + currentText.substring(insertPos + replacingLength);

    return sourceFile.global.compilerFactory.createTempSourceFileFromText(newFileText, sourceFile.getFilePath());
}
