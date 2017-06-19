import * as ts from "typescript";
import {Node} from "./../common";
import {ExpressionWithTypeArguments} from "./../type";

export class HeritageClause extends Node<ts.HeritageClause> {
    /**
     * Gets all the types for the heritage clause.
     */
    getTypes(): ExpressionWithTypeArguments[] {
        if (this.compilerNode.types == null)
            return [];

        return this.compilerNode.types.map(t => this.factory.getExpressionWithTypeArguments(t, this.sourceFile));
    }
}
