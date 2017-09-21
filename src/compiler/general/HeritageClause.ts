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

        return this.compilerNode.types.map(t => this.global.compilerFactory.getNodeFromCompilerNode(t, this.sourceFile)) as ExpressionWithTypeArguments[];
    }

    /**
     * Gets the heritage clause token.
     */
    getToken() {
        return this.compilerNode.token;
    }
}
