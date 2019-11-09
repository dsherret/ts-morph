import { ts } from "@ts-morph/common";
import { LeftHandSideExpressionedNode } from "../expression";
import { TypeNode } from "./TypeNode";

export const ExpressionWithTypeArgumentsBase = LeftHandSideExpressionedNode(TypeNode);
export class ExpressionWithTypeArguments extends ExpressionWithTypeArgumentsBase<ts.ExpressionWithTypeArguments> {
    /**
     * Gets the type arguments.
     */
    getTypeArguments(): TypeNode[] {
        return this.compilerNode.typeArguments?.map(a => this._getNodeFromCompilerNode(a)) ?? [];
    }
}
