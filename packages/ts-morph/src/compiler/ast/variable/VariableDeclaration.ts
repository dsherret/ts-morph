import { errors, SyntaxKind, ts } from "@ts-morph/common";
import { removeChildren, removeCommaSeparatedChild } from "../../../manipulation";
import { VariableDeclarationStructure, VariableDeclarationSpecificStructure, StructureKind } from "../../../structures";
import { BindingNamedNode, ExclamationTokenableNode, InitializerExpressionableNode, TypedNode, ExportGetableNode } from "../base";
import { callBaseSet } from "../callBaseSet";
import { Node } from "../common";
import { callBaseGetStructure } from "../callBaseGetStructure";

const createBase = <T extends typeof Node>(ctor: T) => ExportGetableNode(ExclamationTokenableNode(
    TypedNode(InitializerExpressionableNode(BindingNamedNode(ctor)))
));
export const VariableDeclarationBase = createBase(Node);
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
     * Gets the corresponding variable statement if it exists. Throws for variable declarations in for statements.
     */
    getVariableStatementOrThrow() {
        return errors.throwIfNullOrUndefined(this.getVariableStatement(), "Expected the grandparent to be a variable statement.");
    }

    /**
     * Gets the corresponding variable statement if it exists. Returns undefined for variable declarations in for statements.
     */
    getVariableStatement() {
        const grandParent = this.getParentOrThrow().getParentOrThrow();
        return Node.isVariableStatement(grandParent) ? grandParent : undefined;
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
            kind: StructureKind.VariableDeclaration
        }) as any as VariableDeclarationStructure;
    }
}
