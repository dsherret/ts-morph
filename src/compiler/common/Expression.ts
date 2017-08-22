import * as ts from "typescript";
import {removeChildren, removeCommaSeparatedChild} from "./../../manipulation";
import {Type} from "./../type";
import {Node} from "./Node";

export class Expression extends Node<ts.Expression> {
    /**
     * Gets the contextual type of the expression.
     */
    getContextualType(): Type | undefined {
        return this.global.typeChecker.getContextualType(this);
    }

    /**
     * Removes the expression.
     */
    remove() {
        const parent = this.getParentSyntaxList() || this.getParentOrThrow();
        const isCommaSeparatedChild = parent.getPreviousSiblingIfKind(ts.SyntaxKind.OpenParenToken) != null;

        if (isCommaSeparatedChild)
            removeCommaSeparatedChild(this);
        else
            removeChildren({ children: [this] });
    }
}
