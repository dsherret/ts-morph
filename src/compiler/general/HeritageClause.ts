import * as ts from "typescript";
import {Node} from "./../common";
import {ExpressionWithTypeArguments} from "./../type";

export class HeritageClause extends Node<ts.HeritageClause> {
    /**
     * Gets all the types for the heritage clause.
     */
    getTypes(): ExpressionWithTypeArguments[] {
        if (this.node.types == null)
            return [];

        return this.node.types.map(t => this.factory.getExpressionWithTypeArguments(t));
    }
}
