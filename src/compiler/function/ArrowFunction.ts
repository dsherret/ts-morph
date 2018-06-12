import { ts, SyntaxKind } from "../../typescript";
import { AsyncableNode, BodiedNode, JSDocableNode, ModifierableNode, SignaturedDeclaration, TextInsertableNode, TypeParameteredNode } from "../base";
import { Node } from "../common";
import { Expression } from "../expression";
import { StatementedNode } from "../statement";
import { ArrowFunctionStructure, ArrowFunctionSpecificStructure } from "../../structures";
import { FunctionDeclarationSpecificStructure } from "../../structures";
import { callBaseGetStructure } from "../callBaseGetStructure";

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

    /**
     * Gets the structure equivalent to this node
     */
    getStructure(): ArrowFunctionStructure {
        return callBaseGetStructure<ArrowFunctionSpecificStructure>(ArrowFunctionBase.prototype, this, {
            singleBodyExpression: !this.getEqualsGreaterThan().getNextSibling() ?
                undefined : this.getEqualsGreaterThan().getNextSibling()!.getKind() === SyntaxKind.Block ?
                    undefined : this.getEqualsGreaterThan().getNextSibling()!.getText()
        }) as any as ArrowFunctionStructure; // TODO: might need to add this assertion... I'll make it better later
    }
}
