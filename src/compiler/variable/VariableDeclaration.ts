import * as errors from "../../errors";
import { removeChildren, removeCommaSeparatedChild } from "../../manipulation";
import { VariableDeclarationStructure, VariableDeclarationSpecificStructure } from "../../structures";
import { SyntaxKind, ts } from "../../typescript";
import { BindingNamedNode, ExclamationTokenableNode, InitializerExpressionableNode, TypedNode } from "../base";
import { callBaseSet } from "../callBaseSet";
import { Node } from "../common";
import { callBaseGetStructure } from "../callBaseGetStructure";

export const VariableDeclarationBase = ExclamationTokenableNode(TypedNode(InitializerExpressionableNode(BindingNamedNode(Node))));
export class VariableDeclaration extends VariableDeclarationBase<ts.VariableDeclaration> {
    /**
     * Removes this variable declaration.
     */
    remove() {
        const parent = this.getParentOrThrow();

        switch (parent.getKind()) {
            case SyntaxKind.VariableDeclarationList:
                removeFromDeclarationList(this);
                break;
            case SyntaxKind.CatchClause:
                removeFromCatchClause(this);
                break;
            default:
                throw new errors.NotImplementedError(`Not implemented for syntax kind: ${parent.getKindName()}`);
        }

        function removeFromDeclarationList(node: VariableDeclaration) {
            const variableStatement = parent.getParentIfKindOrThrow(SyntaxKind.VariableStatement);
            const declarations = variableStatement.getDeclarations();
            if (declarations.length === 1)
                variableStatement.remove();
            else
                removeCommaSeparatedChild(node);
        }

        function removeFromCatchClause(node: VariableDeclaration) {
            removeChildren({
                children: [
                    node.getPreviousSiblingIfKindOrThrow(SyntaxKind.OpenParenToken),
                    node,
                    node.getNextSiblingIfKindOrThrow(SyntaxKind.CloseParenToken)
                ],
                removePrecedingSpaces: true
            });
        }
    }

    /**
     * Sets the node from a structure.
     * @param structure - Structure to set the node with.
     */
    set(structure: Partial<VariableDeclarationStructure>) {
        callBaseSet(VariableDeclarationBase.prototype, this, structure);
        return this;
    }

    /**
     * Gets the structure equivalent to this node.
     */
    getStructure(): VariableDeclarationStructure {
        return callBaseGetStructure<VariableDeclarationSpecificStructure>(VariableDeclarationBase.prototype, this, {
        }) as any as VariableDeclarationStructure;
    }
}
