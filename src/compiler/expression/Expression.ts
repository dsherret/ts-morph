import * as ts from "typescript";
import {Type} from "./../type";
import {Node} from "../common";

export class Expression<T extends ts.Expression = ts.Expression> extends Node<T> {
    /**
     * Gets the contextual type of the expression.
     */
    getContextualType(): Type | undefined {
        return this.global.typeChecker.getContextualType(this);
    }
}
