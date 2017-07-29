import * as ts from "typescript";
import {Node, PropertyDeclaration, ClassDeclaration} from "./../../../compiler";
import {PropertyDeclarationStructure} from "./../../../structures";
import {FormattingKind} from "./../FormattingKind";
import {InsertFormatting} from "./InsertFormatting";
import {getClassMemberFormatting} from "./../getClassMemberFormatting";

export class PropertyDeclarationInsertFormatting extends InsertFormatting<PropertyDeclaration, PropertyDeclarationStructure> {
    getInsertPos(): number {
        throw new Error("Not implemented");
    }

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
        return getClassMemberFormatting(this.parent as ClassDeclaration, member);
    }
}
