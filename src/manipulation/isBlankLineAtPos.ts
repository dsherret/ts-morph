import {SourceFile} from "./../compiler";

export function isBlankLineAtPos(sourceFile: SourceFile, pos: number) {
    const fullText = sourceFile.getFullText(sourceFile);
    return /^\s*(\r?\n)\s*(\r?\n)/.test(fullText.substring(pos));
}
