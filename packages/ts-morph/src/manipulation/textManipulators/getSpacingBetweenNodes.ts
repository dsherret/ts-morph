import { Node } from "../../compiler";
import { FormattingKind } from "../formatting";

export interface GetSpacingBetweenNodesOptions<TParentNode extends Node> {
    parent: TParentNode;
    previousSibling: Node | undefined;
    nextSibling: Node | undefined;
    newLineKind: string;
    getSiblingFormatting: (parent: TParentNode, sibling: Node) => FormattingKind;
}

export function getSpacingBetweenNodes<TParentNode extends Node>(opts: GetSpacingBetweenNodesOptions<TParentNode>) {
    const { parent, previousSibling, nextSibling, newLineKind, getSiblingFormatting } = opts;
    if (previousSibling == null || nextSibling == null)
        return "";

    const previousSiblingFormatting = getSiblingFormatting(parent, previousSibling);
    const nextSiblingFormatting = getSiblingFormatting(parent, nextSibling);

    if (previousSiblingFormatting === FormattingKind.Blankline || nextSiblingFormatting === FormattingKind.Blankline)
        return newLineKind + newLineKind;
    else if (previousSiblingFormatting === FormattingKind.Newline || nextSiblingFormatting === FormattingKind.Newline)
        return newLineKind;
    else if (previousSiblingFormatting === FormattingKind.Space || nextSiblingFormatting === FormattingKind.Space)
        return " ";
    else
        return "";
}
