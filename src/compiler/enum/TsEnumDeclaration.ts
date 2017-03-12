import * as ts from "typescript";
import * as structures from "./../../structures";
import {TsNode} from "./../common";
import {TsNamedNode} from "./../base";
import {TsEnumMemberDeclaration} from "./TsEnumMemberDeclaration";

export class TsEnumDeclaration extends TsNamedNode(TsNode)<ts.EnumDeclaration> {
    addMember(structure: structures.EnumMemberStructure) {
        const members = this.getMembers();
        const lastMember = members.length === 0 ? null : members[members.length - 1];
        const shouldAddComma = lastMember != null && !lastMember.endsWithComma();
        const indentationText = this.getIndentationText();
        let memberText = "";

        if (shouldAddComma) memberText += ",";
        memberText += `\n${indentationText}    ${structure.name}`; // todo: Indentation should be retreived from somewhere
        if (structure.value != null) memberText += ` = ${structure.value}`;

        // todo: have a getStandaloneParent method that gets a parent that can stand on its own for being thrown in a source file
        this.getRequiredSourceFile().insertText(lastMember == null ? this.getOpenBraceToken()!.getEnd() : lastMember.getEnd(), memberText);
    }

    getMembers() {
        return this.getMainChildren().filter(c => c instanceof TsEnumMemberDeclaration) as TsEnumMemberDeclaration[];
    }
}
