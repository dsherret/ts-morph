import * as ts from "typescript";
import * as errors from "./../../errors";
import {removeCommaSeparatedChild, removeChildren} from "./../../manipulation";
import {VariableDeclarationStructure} from "./../../structures";
import {callBaseFill} from "./../callBaseFill";
import {Node} from "./../common";
import {InitializerExpressionableNode, BindingNamedNode, TypedNode} from "./../base";
import {VariableStatement} from "./VariableStatement";

export const VariableDeclarationBase = TypedNode(InitializerExpressionableNode(BindingNamedNode(Node)));
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
            case ts.SyntaxKind.VariableDeclarationList:
                removeFromDeclarationList(this);
                break;
            case ts.SyntaxKind.CatchClause:
                removeFromCatchClause(this);
                break;
            default:
                throw new errors.NotImplementedError(`Not implemented for syntax kind: ${parent.getKindName()}`);
        }

        function removeFromDeclarationList(node: VariableDeclaration) {
            const variableStatement = parent.getParentIfKindOrThrow(ts.SyntaxKind.VariableStatement) as VariableStatement;
            const declarations = variableStatement.getDeclarations();
            if (declarations.length === 1)
                variableStatement.remove();
            else
                removeCommaSeparatedChild(node, { removePrecedingSpaces: declarations[0] === node ? false : undefined });
        }

        function removeFromCatchClause(node: VariableDeclaration) {
            removeChildren({
                children: [
                    node.getPreviousSiblingIfKindOrThrow(ts.SyntaxKind.OpenParenToken),
                    node,
                    node.getNextSiblingIfKindOrThrow(ts.SyntaxKind.CloseParenToken)
                ],
                removePrecedingSpaces: true
            });
        }
    }
}
