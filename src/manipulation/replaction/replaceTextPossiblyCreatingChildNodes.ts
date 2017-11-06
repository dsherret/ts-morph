import {Node} from "./../../compiler";
import {replaceTreeWithRange} from "./../tree";
import {getNewReplacementSourceFile} from "./../getNewReplacementSourceFile";

export interface ReplaceTextPossiblyCreatingChildNodesOptions {
    replacePos: number;
    replacingLength: number;
    newText: string;
    parent: Node;
}

/**
 * Replaces a node text while possibly creating new child nodes.
 */
export function replaceTextPossiblyCreatingChildNodes(opts: ReplaceTextPossiblyCreatingChildNodesOptions) {
    const {replacePos, replacingLength, newText, parent} = opts;
    const tempSourceFile = getNewReplacementSourceFile({
        sourceFile: parent.getSourceFile(),
        insertPos: replacePos,
        replacingLength,
        newText
    });

    replaceTreeWithRange({
        parent,
        replacementSourceFile: tempSourceFile,
        start: replacePos,
        end: replacePos + newText.length
    });
}
