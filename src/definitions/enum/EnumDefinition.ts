import * as ts from "typescript";
import {TsEnumDeclaration, TsEnumMemberDeclaration} from "./../../compiler";
import {BaseNodedDefinition, NamedDefinition} from "./../base";

export class EnumDefinition extends NamedDefinition(BaseNodedDefinition)<ts.EnumDeclaration, TsEnumDeclaration> {
    getMembers() {
        return this.tsNode.getMainChildren()
            .filter(c => c instanceof TsEnumMemberDeclaration)
            .map(m => this.factory.getEnumMember(m as TsEnumMemberDeclaration));
    }
}
