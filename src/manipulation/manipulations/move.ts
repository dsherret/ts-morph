import {Node} from "./../../compiler";
import {FormattingKind} from "./../formatting";
import {doManipulation} from "./doManipulation";
import {NodeHandlerFactory} from "./../nodeHandlers";
import {ChangingChildOrderTextManipulator} from "./../textManipulators";

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

    doManipulation(parent.sourceFile,
        new ChangingChildOrderTextManipulator(opts),
        new NodeHandlerFactory().getForChangingChildOrder(opts));
}
