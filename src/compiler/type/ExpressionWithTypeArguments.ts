import * as ts from "typescript";
import {Node} from "./../common";
import {TypeNode} from "./TypeNode";

export class ExpressionWithTypeArguments extends TypeNode<ts.ExpressionWithTypeArguments> {
    /**
     * Gets the expression node.
     */
    getExpression(): Node<ts.LeftHandSideExpression> {
        return this.getNodeFromCompilerNode(this.compilerNode.expression) as Node<ts.LeftHandSideExpression>;
    }

    /**
     * Gets the type arguments.
     */
    getTypeArguments(): TypeNode[] {
        const typeArguments = this.compilerNode.typeArguments;
        if (typeArguments == null)
            return [];

        return typeArguments.map(a => this.getNodeFromCompilerNode(a) as TypeNode);
    }
}
