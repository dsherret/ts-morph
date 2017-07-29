import * as ts from "typescript";
import {Node, PropertyDeclaration} from "./../../compiler";
import {PropertyDeclarationStructure} from "./../../structures";
import {Formatting, FormattingKind} from "./Formatting";

export class PropertyDeclarationFormatting extends Formatting<PropertyDeclaration, PropertyDeclarationStructure> {
    getPrevious() {
        return this.getFormattingForSurroundingMember(this.previousMember);
    }

    getSeparator(structure: PropertyDeclarationStructure, nextStructure: PropertyDeclarationStructure) {
        return FormattingKind.Newline;
    }

    getNext() {
        return this.getFormattingForSurroundingMember(this.nextMember);
    }

    private getFormattingForSurroundingMember(member: Node | undefined) {
        if (member == null)
            return FormattingKind.None;
        if (member.isBodyableNode() && member.getBody() != null)
            return FormattingKind.Blankline;
        if (member.isBodiedNode())
            return FormattingKind.Blankline;

        return FormattingKind.Newline;
    }
}
