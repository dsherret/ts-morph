import * as ts from "typescript";
import {TsEnumMemberDeclaration} from "./../../compiler";
import {BaseNodedDefinition, PropertyNamedDefinition} from "./../base";

export class EnumMemberDefinition extends PropertyNamedDefinition(BaseNodedDefinition)<ts.EnumMember, TsEnumMemberDeclaration> {
    getValue() {
        return this.tsNode.getConstantValue();
    }
}
