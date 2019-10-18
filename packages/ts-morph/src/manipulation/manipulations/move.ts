import { Node } from "../../compiler";
import { FormattingKind } from "../formatting";
import { NodeHandlerFactory } from "../nodeHandlers";
import { ChangingChildOrderTextManipulator } from "../textManipulators";
import { doManipulation } from "./doManipulation";

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
    const { parent } = opts;

    doManipulation(
        parent._sourceFile,
        new ChangingChildOrderTextManipulator(opts),
        new NodeHandlerFactory().getForChangingChildOrder(opts)
    );
}
