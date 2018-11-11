import { SyntaxKind, ts } from "../../../typescript";
import { AsyncableNode, BodiedNode, TextInsertableNode } from "../base";
import { Node } from "../common";
import { Expression } from "../expression";
import { FunctionLikeDeclaration } from "./FunctionLikeDeclaration";

export const ArrowFunctionBase = TextInsertableNode(BodiedNode(AsyncableNode(FunctionLikeDeclaration(Expression))));
export class ArrowFunction extends ArrowFunctionBase<ts.ArrowFunction> {
    /**
     * Gets the equals greater than token of the arrow function.
     */
    getEqualsGreaterThan(): Node<ts.Token<SyntaxKind.EqualsGreaterThanToken>> {
        return this._getNodeFromCompilerNode(this.compilerNode.equalsGreaterThanToken);
    }
}
