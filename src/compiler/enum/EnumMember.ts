import * as ts from "typescript";
import {removeNodes} from "./../../manipulation";
import {Node} from "./../common";
import {SourceFile} from "./../file";
import {PropertyNamedNode, InitializerExpressionableNode, DocumentationableNode, FollowingCommableNode} from "./../base";

export const EnumMemberBase = FollowingCommableNode(DocumentationableNode(InitializerExpressionableNode(PropertyNamedNode(Node))));
export class EnumMember extends EnumMemberBase<ts.EnumMember> {
    /**
     * Gets the constant value of the enum.
     */
    getValue() {
        return this.factory.getTypeChecker().getConstantValue(this);
    }

    /**
     * Removes this enum member and returns the parent.
     * @param sourceFile - Optional source file to help improve performance.
     */
    remove(sourceFile: SourceFile = this.getSourceFileOrThrow()) {
        removeNodes(sourceFile, [this, this.getFollowingComma()]);
    }
}
