import * as ts from "typescript";
import {removeCommaSeparatedChild} from "./../../manipulation";
import {Node} from "./../common";
import {InitializerExpressionableNode, BindingNamedNode, TypedNode} from "./../base";
import {VariableStatement} from "./VariableStatement";
import {VariableDeclarationList} from "./VariableDeclarationList";

export const VariableDeclarationBase = TypedNode(InitializerExpressionableNode(BindingNamedNode(Node)));
export class VariableDeclaration extends VariableDeclarationBase<ts.VariableDeclaration> {
    /**
     * Removes this variable declaration.
     */
    remove() {
        const variableDeclarationList = this.getParentIfKindOrThrow(ts.SyntaxKind.VariableDeclarationList) as VariableDeclarationList;
        const declarations = variableDeclarationList.getDeclarations();
        if (declarations.length === 1)
            (variableDeclarationList.getParentIfKindOrThrow(ts.SyntaxKind.VariableStatement) as VariableStatement).remove();
        else
            removeCommaSeparatedChild(this, { removePrecedingSpaces: declarations[0] === this ? false : undefined });
    }
}
