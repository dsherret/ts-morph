import { ts } from "../../typescript";
import { Node } from "../common/Node";
import { Type } from "../type";

export class Expression<T extends ts.Expression = ts.Expression> extends Node<T> {
    /**
     * Gets the contextual type of the expression.
     */
    getContextualType(): Type | undefined {
        return this.context.typeChecker.getContextualType(this);
    }
}
