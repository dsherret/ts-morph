import * as ts from "typescript";
import {removeChildren, removeCommaSeparatedChild} from "./../../manipulation";
import {NamedNode, TypeParameteredNode} from "./../base";
import {Node} from "./../common";
import {TypeNode} from "./TypeNode";

export const TypeParameterDeclarationBase = NamedNode(Node);
export class TypeParameterDeclaration extends TypeParameterDeclarationBase<ts.TypeParameterDeclaration> {
    /**
     * Gets the constraint node.
     */
    getConstraintNode(): TypeNode | undefined {
        return this.compilerNode.constraint == null ? undefined : (this.global.compilerFactory.getNodeFromCompilerNode(this.compilerNode.constraint, this.sourceFile) as TypeNode);
    }

    /**
     * Removes this type parameter.
     */
    remove() {
        const parentSyntaxList = this.getParentSyntaxListOrThrow();
        const typeParameters = parentSyntaxList.getChildrenOfKind(ts.SyntaxKind.TypeParameter);

        if (typeParameters.length === 1)
            removeAllTypeParameters();
        else
            removeCommaSeparatedChild(this);

        function removeAllTypeParameters() {
            const children = [
                parentSyntaxList.getPreviousSiblingIfKindOrThrow(ts.SyntaxKind.FirstBinaryOperator),
                parentSyntaxList,
                parentSyntaxList.getNextSiblingIfKindOrThrow(ts.SyntaxKind.GreaterThanToken)
            ];

            removeChildren({ children });
        }
    }
}
