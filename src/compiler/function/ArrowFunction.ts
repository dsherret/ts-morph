import { ts, SyntaxKind } from "../../typescript";
import { AsyncableNode, BodiedNode, JSDocableNode, ModifierableNode, SignaturedDeclaration, TextInsertableNode, TypeParameteredNode } from "../base";
import { Node } from "../common";
import { Expression } from "../expression";
import { StatementedNode } from "../statement";

export const ArrowFunctionBase = JSDocableNode(TextInsertableNode(BodiedNode(AsyncableNode(StatementedNode(
    TypeParameteredNode(SignaturedDeclaration(ModifierableNode(Expression))
))))));
export class ArrowFunction extends ArrowFunctionBase<ts.ArrowFunction> {
    /**
     * Gets the equals greater than token of the arrow function.
     */
    getEqualsGreaterThan(): Node<ts.Token<SyntaxKind.EqualsGreaterThanToken>> {
        return this.getNodeFromCompilerNode(this.compilerNode.equalsGreaterThanToken);
    }
}
