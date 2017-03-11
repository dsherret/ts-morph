import * as ts from "typescript";
import * as structures from "./../../structures";
import {TsNode} from "./../common";
import {TsNamedNode} from "./../base";
import {TsEnumMemberDeclaration} from "./TsEnumMemberDeclaration";

export class TsEnumDeclaration extends TsNamedNode(TsNode)<ts.EnumDeclaration> {
    addMember(structure: structures.EnumMemberStructure) {

    }

    getMembers() {
        return this.getMainChildren().filter(c => c instanceof TsEnumMemberDeclaration) as TsEnumMemberDeclaration[];
    }
}
