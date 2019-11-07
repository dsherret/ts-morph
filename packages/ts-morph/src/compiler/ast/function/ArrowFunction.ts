import { SyntaxKind, ts } from "@ts-morph/common";
import { AsyncableNode, BodiedNode, TextInsertableNode } from "../base";
import { Node } from "../common";
import { Expression } from "../expression";
import { FunctionLikeDeclaration } from "./FunctionLikeDeclaration";

const createArrowFunctionBase = <T extends typeof Expression>(ctor: T) => TextInsertableNode(BodiedNode(AsyncableNode(
    FunctionLikeDeclaration(ctor)
)));
export const ArrowFunctionBase = createArrowFunctionBase(Expression);
export class ArrowFunction extends ArrowFunctionBase<ts.ArrowFunction> {
    /**
     * Gets the equals greater than token of the arrow function.
     */
    getEqualsGreaterThan(): Node<ts.Token<SyntaxKind.EqualsGreaterThanToken>> {
        return this._getNodeFromCompilerNode(this.compilerNode.equalsGreaterThanToken);
    }
}
