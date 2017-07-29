import * as errors from "./../errors";
import {Node, SourceFile} from "./../compiler";
import {getInsertErrorMessageText} from "./getInsertErrorMessageText";
import {replaceTreeCreatingSyntaxList} from "./tree";

export interface InsertCreatingSyntaxListOptions {
    parent: Node;
    insertPos: number;
    newText: string;
}

export function insertCreatingSyntaxList(opts: InsertCreatingSyntaxListOptions) {
    const {parent, insertPos, newText} = opts;
    const sourceFile = parent.getSourceFile();
    const currentText = sourceFile.getFullText();
    const newFileText = currentText.substring(0, insertPos) + newText + currentText.substring(insertPos);
    const tempSourceFile = sourceFile.global.compilerFactory.createTempSourceFileFromText(newFileText, sourceFile.getFilePath());

    replaceTreeCreatingSyntaxList({
        parent,
        replacementSourceFile: tempSourceFile
    });
}
