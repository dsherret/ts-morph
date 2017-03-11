import * as ts from "typescript";
import {TsNode} from "./../common";
import {TsPropertyNamedNode} from "./../base";

export class TsEnumMemberDeclaration extends TsPropertyNamedNode(TsNode)<ts.EnumMember> {
    getConstantValue() {
        return this.factory.getLanguageService().getProgram().getTypeChecker().getConstantValue(this);
    }
}
