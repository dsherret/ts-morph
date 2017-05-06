import * as ts from "typescript";
import {Node} from "./Node";
import {Type} from "./../type";
import {TypeChecker} from "./../tools";

export class Expression extends Node<ts.Expression> {
    /**
     * Gets the contextual type of the expression.
     */
    getContextualType(): Type | undefined {
        return this.factory.getTypeChecker().getContextualType(this);
    }
}
