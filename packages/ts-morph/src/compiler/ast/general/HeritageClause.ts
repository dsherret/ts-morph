import { ts } from "@ts-morph/common";
import { removeChildren, removeCommaSeparatedChild, verifyAndGetIndex } from "../../../manipulation";
import { Node } from "../common";
import { ExpressionWithTypeArguments } from "../type";

export class HeritageClause extends Node<ts.HeritageClause> {
    /**
     * Gets all the type nodes for the heritage clause.
     */
    getTypeNodes(): ExpressionWithTypeArguments[] {
        return this.compilerNode.types?.map(t => this._getNodeFromCompilerNode(t)) ?? [];
    }

    /**
     * Gets the heritage clause token.
     */
    getToken() {
        return this.compilerNode.token;
    }

    /**
     * Remove the expression from the heritage clause.
     * @param index - Index of the expression to remove.
     */
    removeExpression(index: number): this;
    /**
     * Removes the expression from the heritage clause.
     * @param expressionNode - Expression to remove.
     */
    removeExpression(expressionNode: ExpressionWithTypeArguments): this;
    /**
     * @internal
     */
    removeExpression(expressionNodeOrIndex: ExpressionWithTypeArguments | number): this;
    removeExpression(expressionNodeOrIndex: ExpressionWithTypeArguments | number) {
        const expressions = this.getTypeNodes();
        const expressionNodeToRemove = typeof expressionNodeOrIndex === "number" ? getExpressionFromIndex(expressionNodeOrIndex) : expressionNodeOrIndex;

        if (expressions.length === 1) {
            const heritageClauses = this.getParentSyntaxListOrThrow().getChildren();
            if (heritageClauses.length === 1)
                removeChildren({ children: [heritageClauses[0].getParentSyntaxListOrThrow()], removePrecedingSpaces: true });
            else
                removeChildren({ children: [this], removePrecedingSpaces: true });
        }
        else {
            removeCommaSeparatedChild(expressionNodeToRemove);
        }

        return this;

        function getExpressionFromIndex(index: number) {
            return expressions[verifyAndGetIndex(index, expressions.length - 1)];
        }
    }
}
