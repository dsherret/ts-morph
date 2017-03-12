import * as ts from "typescript";
import {Node} from "./../common";
import {PropertyNamedNode, InitializerExpressionedNode} from "./../base";

export class EnumMemberDeclaration extends InitializerExpressionedNode(PropertyNamedNode(Node))<ts.EnumMember> {
    getValue() {
        return this.factory.getLanguageService().getProgram().getTypeChecker().getConstantValue(this);
    }

    /**
     * Gets if this enum member ends with a comma.
     */
    endsWithComma() {
        const nextSibling = this.getNextSibling();
        if (nextSibling == null)
            return false;

        return nextSibling.getKind() === ts.SyntaxKind.CommaToken;
    }
}
