import * as ts from "typescript";
import {removeNodes} from "./../../manipulation";
import {Node} from "./../common";
import {PropertyNamedNode, InitializerExpressionableNode, DocumentationableNode} from "./../base";

export const EnumMemberBase = DocumentationableNode(InitializerExpressionableNode(PropertyNamedNode(Node)));
export class EnumMember extends EnumMemberBase<ts.EnumMember> {
    /**
     * Gets the constant value of the enum.
     */
    getValue() {
        return this.factory.getTypeChecker().getConstantValue(this);
    }

    /**
     * Removes this enum member.
     */
    remove() {
        removeNodes([this, this.getNextSiblingIfKind(ts.SyntaxKind.CommaToken)]);
    }
}
