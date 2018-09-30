import { ts } from "../../../typescript";
import { Type } from "../../types";
import { Node } from "../common/Node";

export class Expression<T extends ts.Expression = ts.Expression> extends Node<T> {
    /**
     * Gets the contextual type of the expression.
     */
    getContextualType(): Type | undefined {
        return this.context.typeChecker.getContextualType(this);
    }
}
