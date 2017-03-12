import * as ts from "typescript";
import {TsNode} from "./../common";
import {TsPropertyNamedNode} from "./../base";

export class TsEnumMemberDeclaration extends TsPropertyNamedNode(TsNode)<ts.EnumMember> {
    getConstantValue() {
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
