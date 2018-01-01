import {Node} from "./../../compiler";
import {doManipulation} from "./../doManipulation";
import {InsertionTextManipulator} from "./../textManipulators";
import {NodeHandlerFactory} from "./../nodeHandlers";

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

    doManipulation(parent.sourceFile, new InsertionTextManipulator({
        insertPos: replacePos,
        replacingLength,
        newText
    }), new NodeHandlerFactory().getForRange({
        parent,
        start: replacePos,
        end: replacePos + newText.length
    }));
}
