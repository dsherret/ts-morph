import * as ts from "typescript";
import {Node} from "./../common";
import {PropertyNamedNode, InitializerExpressionableNode, DocumentationableNode, FollowingCommableNode} from "./../base";

export const EnumMemberBase = FollowingCommableNode(DocumentationableNode(InitializerExpressionableNode(PropertyNamedNode(Node))));
export class EnumMember extends EnumMemberBase<ts.EnumMember> {
    /**
     * Gets the constant value of the enum.
     */
    getValue() {
        return this.factory.getLanguageService().getProgram().getTypeChecker().getConstantValue(this);
    }

    /**
     * Removes this enum member and returns the parent.
     */
    remove() {
        const parent = this.getParent();
        this.getRequiredSourceFile().removeNodes(this, this.getFollowingComma());
        return parent;
    }
}
