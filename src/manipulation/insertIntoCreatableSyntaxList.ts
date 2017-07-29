import {Node} from "./../compiler";
import {replaceTreeCreatingSyntaxList, replaceTreeWithChildIndex} from "./tree";

export interface InsertIntoCreatableSyntaxListOptions {
    insertPos: number;
    newText: string;
    parent: Node;
    syntaxList: Node | undefined;
    childIndex: number;
    insertItemsCount: number;
}

export function insertIntoCreatableSyntaxList(opts: InsertIntoCreatableSyntaxListOptions) {
    const {insertPos, newText, parent, syntaxList, childIndex, insertItemsCount} = opts;
    const sourceFile = parent.getSourceFile();
    const compilerFactory = sourceFile.global.compilerFactory;
    const currentText = sourceFile.getFullText();
    const newFileText = currentText.substring(0, insertPos) + newText + currentText.substring(insertPos);
    const tempSourceFile = compilerFactory.createTempSourceFileFromText(newFileText, sourceFile.getFilePath());

    if (syntaxList == null)
        replaceTreeCreatingSyntaxList({
            parent,
            replacementSourceFile: tempSourceFile
        });
    else
        replaceTreeWithChildIndex({
            parent: syntaxList,
            childCount: insertItemsCount,
            childIndex,
            replacementSourceFile: tempSourceFile
        });
}
