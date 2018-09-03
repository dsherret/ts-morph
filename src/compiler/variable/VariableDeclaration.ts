import * as errors from "../../errors";
import { removeChildren, removeCommaSeparatedChild } from "../../manipulation";
import { VariableDeclarationStructure, VariableDeclarationSpecificStructure } from "../../structures";
import { SyntaxKind, ts } from "../../typescript";
import { BindingNamedNode, ExclamationTokenableNode, InitializerExpressionableNode, TypedNode } from "../base";
import { callBaseFill } from "../callBaseFill";
import { Node } from "../common";
import { callBaseGetStructure } from "../callBaseGetStructure";

export const VariableDeclarationBase = ExclamationTokenableNode(TypedNode(InitializerExpressionableNode(BindingNamedNode(Node))));
export class VariableDeclaration extends VariableDeclarationBase<ts.VariableDeclaration> {
    /**
     * Fills this node with the specified structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<VariableDeclarationStructure>) {
        callBaseFill(VariableDeclarationBase.prototype, this, structure);
        return this;
    }

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
     * Gets the structure equivalent to this node
     */
    getStructure(): VariableDeclarationStructure {
        const initializer = this.getInitializer();
        return callBaseGetStructure<VariableDeclarationSpecificStructure>(VariableDeclarationBase.prototype, this, {
        }) as any as VariableDeclarationStructure;
    }
}
