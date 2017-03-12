import * as ts from "typescript";
import * as structures from "./../../structures";
import {Node} from "./../common";
import {NamedNode} from "./../base";
import {EnumMemberDeclaration} from "./EnumMemberDeclaration";

export class EnumDeclaration extends NamedNode(Node)<ts.EnumDeclaration> {
    addMember(structure: structures.EnumMemberStructure) {
        const members = this.getMembers();
        const lastMember = members.length === 0 ? null : members[members.length - 1];
        const shouldAddComma = lastMember != null && !lastMember.endsWithComma();
        const indentationText = this.getIndentationText();
        let memberText = "";

        if (shouldAddComma) memberText += ",";
        memberText += `\n${indentationText}    ${structure.name}`; // todo: Indentation should be retreived from somewhere

        // todo: have a getStandaloneParent method that gets a parent that can stand on its own for being thrown in a source file
        this.getRequiredSourceFile().insertText(lastMember == null ? this.getFirstChildByKind(ts.SyntaxKind.OpenBraceToken)!.getEnd() : lastMember.getEnd(), memberText);

        const newMembers = this.getMembers();
        const declaration = newMembers[newMembers.length - 1] as EnumMemberDeclaration;
        if (structure.value != null)
            declaration.setInitializer(structure.value.toString());
        return declaration;
    }

    getMembers() {
        return this.getMainChildren().filter(c => c instanceof EnumMemberDeclaration) as EnumMemberDeclaration[];
    }
}
