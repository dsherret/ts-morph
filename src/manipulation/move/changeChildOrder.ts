import {Node} from "./../../compiler";
import {FormattingKind} from "./../formatting";
import {replaceTreeChangingChildOrder} from "./../tree";
import {getTextChangingChildOrder} from "./../text";

export interface ChangeChildOrderOptions<TParentNode extends Node> {
    parent: TParentNode;
    getSiblingFormatting: (parent: TParentNode, sibling: Node) => FormattingKind;
    oldIndex: number;
    newIndex: number;
}

/**
 * Changes the child older of two nodes within a parent.
 * @param opts - Options.
 */
export function changeChildOrder<TParentNode extends Node>(opts: ChangeChildOrderOptions<TParentNode>) {
    const {parent, getSiblingFormatting, oldIndex, newIndex} = opts;
    const newText = getTextChangingChildOrder({ parent, getSiblingFormatting, oldIndex, newIndex });
    const sourceFile = parent.sourceFile;
    const tempSourceFile = sourceFile.global.compilerFactory.createTempSourceFileFromText(newText, sourceFile.getFilePath());

    replaceTreeChangingChildOrder({
        parent,
        newIndex,
        oldIndex,
        replacementSourceFile: tempSourceFile
    });
}
