import * as ts from "typescript";
import {Node} from "./Node";
import {Type} from "./../type";
import {TypeChecker} from "./../tools";

export class Expression extends Node<ts.Expression> {
    /**
     * Gets the contextual type of the expression.
     * @param typeChecker - Optional type Checker.
     */
    getContextualType(typeChecker: TypeChecker = this.factory.getTypeChecker()): Type | undefined {
        return typeChecker.getContextualType(this);
    }
}
