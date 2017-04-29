import * as ts from "typescript";
import {TypeNodeBase, TypeNode} from "./TypeNode";

export class ExpressionWithTypeArguments extends TypeNodeBase<ts.ExpressionWithTypeArguments> {
    /**
     * Gets the compiler expression node.
     */
    getCompilerExpression(): ts.LeftHandSideExpression {
        return this.node.expression;
    }

    /**
     * Gets the type arguments.
     */
    getTypeArguments(): TypeNode[] {
        const typeArguments = this.node.typeArguments;
        if (typeArguments == null)
            return [];

        return typeArguments.map(a => this.factory.getTypeNode(a));
    }
}
