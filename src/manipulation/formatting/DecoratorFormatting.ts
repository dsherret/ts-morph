import * as ts from "typescript";
import {Node, Decorator} from "./../../compiler";
import {DecoratorStructure} from "./../../structures";
import {Formatting, FormattingKind} from "./Formatting";

export class DecoratorFormatting extends Formatting<Decorator, DecoratorStructure> {
    constructor() {
        super(ts.SyntaxKind.Decorator);
    }

    getPrevious(member: Decorator | DecoratorStructure, surroundingMember: Decorator) {
        if (surroundingMember.getParentOrThrow().getKind() === ts.SyntaxKind.Parameter)
            return FormattingKind.Space;
        return FormattingKind.Newline;
    }

    getSeparator(parent: Node, structure: DecoratorStructure, nextStructure: DecoratorStructure) {
        if (parent.getKind() === ts.SyntaxKind.Parameter)
            return FormattingKind.Space;
        return FormattingKind.Newline;
    }

    getNext(member: Decorator | DecoratorStructure, surroundingMember: Decorator) {
        return this.getPrevious(member, surroundingMember);
    }
}
