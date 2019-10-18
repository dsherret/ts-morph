import { removeChildren, removeCommaSeparatedChild, insertIntoParentTextRange } from "../../../manipulation";
import { errors, StringUtils, SyntaxKind, ts } from "@ts-morph/common";
import { WriterFunction } from "../../../types";
import { NamedNode } from "../base";
import { Node } from "../common";
import { TypeNode } from "./TypeNode";
import { TypeParameterDeclarationStructure, TypeParameterDeclarationSpecificStructure, StructureKind } from "../../../structures";
import { callBaseGetStructure } from "../callBaseGetStructure";
import { callBaseSet } from "../callBaseSet";

export const TypeParameterDeclarationBase = NamedNode(Node);
export class TypeParameterDeclaration extends TypeParameterDeclarationBase<ts.TypeParameterDeclaration> {
    /**
     * Gets the constraint of the type parameter.
     */
    getConstraint(): TypeNode | undefined {
        return this._getNodeFromCompilerNodeIfExists(this.compilerNode.constraint);
    }

    /**
     * Gets the constraint of the type parameter or throws if it doesn't exist.
     */
    getConstraintOrThrow() {
        return errors.throwIfNullOrUndefined(this.getConstraint(), "Expected to find the type parameter's constraint.");
    }

    /**
     * Sets the type parameter constraint.
     * @param text - Text to set as the constraint.
     */
    setConstraint(text: string | WriterFunction) {
        text = this.getParentOrThrow()._getTextWithQueuedChildIndentation(text);
        if (StringUtils.isNullOrWhitespace(text)) {
            this.removeConstraint();
            return this;
        }

        const constraint = this.getConstraint();
        if (constraint != null) {
            constraint.replaceWithText(text);
            return this;
        }

        const nameNode = this.getNameNode();
        insertIntoParentTextRange({
            parent: this,
            insertPos: nameNode.getEnd(),
            newText: ` extends ${text}`
        });

        return this;
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
        return this._getNodeFromCompilerNodeIfExists(this.compilerNode.default);
    }

    /**
     * Gets the default node of the type parameter or throws if it doesn't exist.
     */
    getDefaultOrThrow() {
        return errors.throwIfNullOrUndefined(this.getDefault(), "Expected to find the type parameter's default.");
    }

    /**
     * Sets the type parameter default type node.
     * @param text - Text to set as the default type node.
     */
    setDefault(text: string | WriterFunction) {
        text = this.getParentOrThrow()._getTextWithQueuedChildIndentation(text);
        if (StringUtils.isNullOrWhitespace(text)) {
            this.removeDefault();
            return this;
        }

        const defaultNode = this.getDefault();
        if (defaultNode != null) {
            defaultNode.replaceWithText(text);
            return this;
        }

        const insertAfterNode = this.getConstraint() || this.getNameNode();
        insertIntoParentTextRange({
            parent: this,
            insertPos: insertAfterNode.getEnd(),
            newText: ` = ${text}`
        });

        return this;
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

    /**
     * Sets the node from a structure.
     * @param structure - Structure to set the node with.
     */
    set(structure: Partial<TypeParameterDeclarationStructure>) {
        callBaseSet(TypeParameterDeclarationBase.prototype, this, structure);

        if (structure.constraint != null)
            this.setConstraint(structure.constraint);
        else if (structure.hasOwnProperty(nameof(structure.constraint)))
            this.removeConstraint();

        if (structure.default != null)
            this.setDefault(structure.default);
        else if (structure.hasOwnProperty(nameof(structure.default)))
            this.removeDefault();

        return this;
    }

    /**
     * Gets the structure equivalent to this node.
     */
    getStructure(): TypeParameterDeclarationStructure {
        const constraintNode = this.getConstraint();
        const defaultNode = this.getDefault();

        return callBaseGetStructure<TypeParameterDeclarationSpecificStructure>(TypeParameterDeclarationBase.prototype, this, {
            kind: StructureKind.TypeParameter,
            constraint: constraintNode != null ? constraintNode.getText({ trimLeadingIndentation: true }) : undefined,
            default: defaultNode ? defaultNode.getText({ trimLeadingIndentation: true }) : undefined
        });
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
