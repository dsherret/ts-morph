import * as ts from "typescript";
import * as errors from "./../../errors";
import {removeChildren, removeCommaSeparatedChild} from "./../../manipulation";
import {Node} from "./../common";

export class TypeNode<T extends ts.TypeNode = ts.TypeNode> extends Node<T> {
    /**
     * Removes this type node if able.
     */
    remove() {
        const parentSyntaxList = this.getParentSyntaxList();
        if (parentSyntaxList == null)
            throw new errors.NotImplementedError("Removing a type node in this scenario is not supported.");

        const previousParentSibling = parentSyntaxList.getPreviousSiblingIfKind(ts.SyntaxKind.FirstBinaryOperator);
        const nextParentSibling = parentSyntaxList.getNextSiblingIfKind(ts.SyntaxKind.GreaterThanToken);

        if (previousParentSibling == null || nextParentSibling == null)
            throw new errors.NotImplementedError("Removing a type node in this scenario is not supported.");

        const typeArgs = parentSyntaxList.getChildrenOfKind(ts.SyntaxKind.TypeReference);
        if (typeArgs.length === 1)
            removeChildren({ children: [previousParentSibling, parentSyntaxList, nextParentSibling] });
        else
            removeCommaSeparatedChild(this);
    }
}
