import {Node} from "./../../compiler";
import {FormattingKind} from "./../formatting";
import {RemoveChildrenWithFormattingTextManipulator} from "./../textManipulators";
import {doManipulation} from "./../doManipulation";
import {NodeHandlerFactory} from "./../nodeHandlers";

export interface RemoveChildrenWithFormattingOptions<TNode extends Node> {
    children: Node[];
    getSiblingFormatting: (parent: TNode, sibling: Node) => FormattingKind;
}

export function removeChildrenWithFormattingFromCollapsibleSyntaxList<TNode extends Node>(opts: RemoveChildrenWithFormattingOptions<TNode>) {
    const {children} = opts;
    if (children.length === 0)
        return;

    const syntaxList = children[0].getParentSyntaxListOrThrow();
    if (syntaxList.getChildCount() === children.length) {
        removeChildrenWithFormatting({
            children: [syntaxList],
            getSiblingFormatting: () => FormattingKind.None
        });
    }
    else
        removeChildrenWithFormatting(opts);
}

export function removeChildrenWithFormatting<TNode extends Node>(opts: RemoveChildrenWithFormattingOptions<TNode>) {
    const {children, getSiblingFormatting} = opts;
    if (children.length === 0)
        return;

    doManipulation(children[0].sourceFile, new RemoveChildrenWithFormattingTextManipulator<TNode>({
        children,
        getSiblingFormatting
    }), new NodeHandlerFactory().getForChildIndex({
        parent: children[0].getParentSyntaxList() || children[0].getParentOrThrow(),
        childIndex: children[0].getChildIndex(),
        childCount: -1 * children.length
    }));
}
