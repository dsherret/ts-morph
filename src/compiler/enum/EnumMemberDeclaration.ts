import * as ts from "typescript";
import {Node} from "./../common";
import {PropertyNamedNode, InitializerExpressionableNode, DocumentationableNode} from "./../base";

export const EnumMemberDeclarationBase = DocumentationableNode(InitializerExpressionableNode(PropertyNamedNode(Node)));
export class EnumMemberDeclaration extends EnumMemberDeclarationBase<ts.EnumMember> {
    /**
     * Gets the constant value of the enum.
     */
    getValue() {
        return this.factory.getLanguageService().getProgram().getTypeChecker().getConstantValue(this);
    }

    /**
     * Gets if this enum member ends with a comma.
     */
    endsWithComma() {
        return this.getFollowingComma() != null;
    }

    /**
     * Removes this enum member and returns the parent.
     */
    remove() {
        const parent = this.getParent();
        this.getRequiredSourceFile().removeNodes(this, this.getFollowingComma());
        return parent;
    }

    /**
     * Gets the following comma node if it exists.
     */
    getFollowingComma() {
        const nextSibling = this.getNextSibling();
        if (nextSibling == null || nextSibling.getKind() !== ts.SyntaxKind.CommaToken)
            return undefined;

        return nextSibling;
    }
}
