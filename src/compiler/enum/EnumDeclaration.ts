import * as ts from "typescript";
import * as structures from "./../../structures";
import {Node} from "./../common";
import {NamedNode} from "./../base";
import {EnumMemberDeclaration} from "./EnumMemberDeclaration";

export class EnumDeclaration extends NamedNode(Node)<ts.EnumDeclaration> {
    addMember(structure: structures.EnumMemberStructure) {
        const members = this.getMembers();
        const lastMember = members.length === 0 ? null : members[members.length - 1];
        const lastMemberEndsWithComma = lastMember != null && lastMember.endsWithComma();
        const indentationText = this.getChildIndentationText();

        // create member text
        let memberText = "";
        if (lastMember != null && !lastMemberEndsWithComma)
            memberText += ",";
        memberText += `\n${indentationText}${structure.name}`;

        // get the insert position
        let insertPos: number;
        if (lastMember == null)
            insertPos = this.getFirstChildByKind(ts.SyntaxKind.OpenBraceToken)!.getEnd();
        else if (lastMemberEndsWithComma)
            insertPos = lastMember.getFollowingComma()!.getEnd();
        else
            insertPos = lastMember.getEnd();

        // insert
        this.getRequiredSourceFile().insertText(insertPos, memberText);

        // get the member
        const newMembers = this.getMembers();
        const declaration = newMembers[newMembers.length - 1] as EnumMemberDeclaration;

        // add any other properties to it
        if (structure.value != null)
            declaration.setInitializer(structure.value.toString());

        return declaration;
    }

    getMembers() {
        return this.getMainChildren().filter(c => c instanceof EnumMemberDeclaration) as EnumMemberDeclaration[];
    }
}
