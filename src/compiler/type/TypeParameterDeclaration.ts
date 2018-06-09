import { removeChildren, removeCommaSeparatedChild } from "../../manipulation";
import { SyntaxKind, ts } from "../../typescript";
import { NamedNode } from "../base";
import { Node } from "../common";
import { TypeNode } from "./TypeNode";

export const TypeParameterDeclarationBase = NamedNode(Node);
export class TypeParameterDeclaration extends TypeParameterDeclarationBase<ts.TypeParameterDeclaration> {
    /**
     * Gets the constraint node of the type parameter.
     * @deprecated - Use .getConstraint().
     */
    getConstraintNode(): TypeNode | undefined {
        return this.getConstraint();
    }

    /**
     * Gets the constraint of the type parameter.
     */
    getConstraint(): TypeNode | undefined {
        return this.getNodeFromCompilerNodeIfExists(this.compilerNode.constraint);
    }

    /**
     * Removes the constraint type node.
     */
    removeConstraint() {
        removeConstraintOrDefault(this.getConstraint(), SyntaxKind.ExtendsKeyword);
        return this;
    }

    /**
     * Gets the default node of the type parameter.
     */
    getDefault(): TypeNode | undefined {
        return this.getNodeFromCompilerNodeIfExists(this.compilerNode.default);
    }

    /**
     * Gets the default node of the type parameter.
     * @deprecated Use .getDefault().
     */
    getDefaultNode(): TypeNode | undefined {
        return this.getNodeFromCompilerNodeIfExists(this.compilerNode.default);
    }

    /**
     * Removes the default type node.
     */
    removeDefault() {
        removeConstraintOrDefault(this.getDefault(), SyntaxKind.EqualsToken);
        return this;
    }

    /**
     * Removes this type parameter.
     */
    remove() {
        const parentSyntaxList = this.getParentSyntaxListOrThrow();
        const typeParameters = parentSyntaxList.getChildrenOfKind(SyntaxKind.TypeParameter);

        if (typeParameters.length === 1)
            removeAllTypeParameters();
        else
            removeCommaSeparatedChild(this);

        function removeAllTypeParameters() {
            const children = [
                parentSyntaxList.getPreviousSiblingIfKindOrThrow(SyntaxKind.LessThanToken),
                parentSyntaxList,
                parentSyntaxList.getNextSiblingIfKindOrThrow(SyntaxKind.GreaterThanToken)
            ];

            removeChildren({ children });
        }
    }
}

function removeConstraintOrDefault(nodeToRemove: Node | undefined, siblingKind: SyntaxKind) {
    if (nodeToRemove == null)
        return;

    removeChildren({
        children: [nodeToRemove.getPreviousSiblingIfKindOrThrow(siblingKind), nodeToRemove],
        removePrecedingSpaces: true
    });
}
