import * as errors from "./../errors";
import {Node, SourceFile} from "./../compiler";
import {getInsertErrorMessageText} from "./getInsertErrorMessageText";
import {insertStraight} from "./insertStraight";
import {areNodesEqual} from "./areNodesEqual";
import {replaceTreeWithChildIndex} from "./replaceTree";

export interface InsertIntoSyntaxListOptions {
    insertPos: number;
    newText: string;
    syntaxList: Node;
    childIndex: number;
    insertItemsCount: number;
}

/**
 * Insert into a syntax list.
 */
export function insertIntoSyntaxList(opts: InsertIntoSyntaxListOptions) {
    const {insertPos, newText, syntaxList, childIndex, insertItemsCount} = opts;
    const sourceFile = syntaxList.getSourceFile();
    const compilerFactory = sourceFile.global.compilerFactory;
    const currentText = sourceFile.getFullText();
    const newFileText = currentText.substring(0, insertPos) + newText + currentText.substring(insertPos);
    const tempSourceFile = compilerFactory.createTempSourceFileFromText(newFileText, sourceFile.getFilePath());

    replaceTreeWithChildIndex({
        replacementSourceFile: tempSourceFile,
        parent: syntaxList,
        childIndex,
        childCount: insertItemsCount
    });
}
