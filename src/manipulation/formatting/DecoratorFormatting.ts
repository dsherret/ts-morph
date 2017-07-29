import * as ts from "typescript";
import {Node, Decorator, DecoratableNode} from "./../../compiler";
import {Memoize} from "./../../utils";
import {DecoratorStructure} from "./../../structures";
import {Formatting, FormattingKind} from "./Formatting";

export class DecoratorFormatting extends Formatting<Decorator, DecoratorStructure> {
    getPrevious() {
        if (this.previousMember == null)
            return FormattingKind.None;
        return this.getFormattingKind();
    }

    getSeparator(structure: DecoratorStructure, nextStructure: DecoratorStructure) {
        return this.getFormattingKind();
    }

    getNext() {
        if (this.previousMember == null)
            return this.getFormattingKind();
        return FormattingKind.None;
    }

    @Memoize
    private getFormattingKind() {
        const areDecoratorsOnSameLine = this.areDecoratorsOnSameLine();
        if (areDecoratorsOnSameLine)
            return FormattingKind.Space;
        return FormattingKind.Newline;
    }

    private areDecoratorsOnSameLine() {
        const currentDecorators = this.children;
        if (currentDecorators.length <= 1)
            return this.parent.getKind() === ts.SyntaxKind.Parameter;

        const startLinePos = currentDecorators[0].getStartLinePos();
        for (let i = 1; i < currentDecorators.length; i++) {
            if (currentDecorators[i].getStartLinePos() !== startLinePos)
                return false;
        }

        return true;
    }
}
