import * as ts from "typescript";
import {Expression} from "./../expression";
import {JSDocableNode, NameableNode, ModifierableNode, AsyncableNode, GeneratorableNode, BodiedNode, TextInsertableNode} from "./../base";
import {Node} from "./../common";
import {StatementedNode} from "./../statement";
import {SignaturedDeclaration} from "./SignaturedDeclaration";

export const ArrowFunctionBase = JSDocableNode(TextInsertableNode(BodiedNode(AsyncableNode(StatementedNode(
    SignaturedDeclaration(ModifierableNode(Expression)
))))));
export class ArrowFunction extends ArrowFunctionBase<ts.ArrowFunction> {
    /**
     * Gets the equals greater than token of the arrow function.
     */
    getEqualsGreaterThan() {
        return this.getNodeFromCompilerNode(this.compilerNode.equalsGreaterThanToken);
    }
}
