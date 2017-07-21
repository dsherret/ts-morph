import * as ts from "typescript";
import {Node, PropertyDeclaration} from "./../../compiler";
import {PropertyDeclarationStructure} from "./../../structures";
import {Formatting, FormattingKind} from "./Formatting";

export class PropertyDeclarationFormatting extends Formatting<PropertyDeclaration, PropertyDeclarationStructure> {
    constructor() {
        super(ts.SyntaxKind.PropertyDeclaration);
    }

    getPrevious(member: PropertyDeclaration | PropertyDeclarationStructure, surroundingMember: PropertyDeclaration) {
        const indentationText = surroundingMember.getIndentationText();
        if (surroundingMember.isBodyableNode() && surroundingMember.getBody() != null)
            return FormattingKind.Blankline;
        if (surroundingMember.isBodiedNode())
            return FormattingKind.Blankline;
        return FormattingKind.Newline;
    }

    getSeparator(parent: Node, structure: PropertyDeclarationStructure, nextStructure: PropertyDeclarationStructure) {
        return FormattingKind.Newline;
    }

    getNext(member: PropertyDeclaration | PropertyDeclarationStructure, surroundingMember: PropertyDeclaration) {
        return this.getPrevious(member, surroundingMember);
    }
}
