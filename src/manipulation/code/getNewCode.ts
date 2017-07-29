import * as ts from "typescript";
import {Node} from "./../../compiler";
import * as errors from "./../../errors";
import {InsertFormatting, FormattingKind} from "./../formatting";

export interface GetNewCodeOptions<TNode extends Node, TStructure> {
    structures: TStructure[];
    newCodes: string[];
    parent: Node;
    indentationText?: string;
    formatting: InsertFormatting;
}

export function getNewCode<TNode extends Node, TStructure>(opts: GetNewCodeOptions<TNode, TStructure>) {
    const {structures, newCodes, parent, formatting} = opts;
    const indentationText = opts.indentationText == null ? parent.getChildIndentationText() : opts.indentationText;
    const newLineChar = parent.global.manipulationSettings.getNewLineKind();

    return getPrefixCode() + getChildCode() + getSuffixCode();

    function getPrefixCode() {
        return getFormattingKindTextWithIndent(formatting.getPrevious());
    }

    function getChildCode() {
        let code = newCodes[0];
        for (let i = 1; i < newCodes.length; i++) {
            const formattingKind = formatting.getSeparator(structures[i - 1], structures[i]);
            code += getFormattingKindTextWithIndent(formattingKind);
            code += newCodes[i];
        }
        return code;
    }

    function getSuffixCode() {
        return getFormattingKindTextWithIndent(formatting.getNext());
    }

    function getFormattingKindTextWithIndent(formattingKind: FormattingKind) {
        let code = getFormattingKindText(formattingKind);
        if (formattingKind === FormattingKind.Newline || formattingKind === FormattingKind.Blankline)
            code += indentationText;
        return code;
    }

    function getFormattingKindText(formattingKind: FormattingKind) {
        switch (formattingKind) {
            case FormattingKind.Space:
                return " ";
            case FormattingKind.Newline:
                return newLineChar;
            case FormattingKind.Blankline:
                return newLineChar + newLineChar;
            case FormattingKind.None:
                return "";
            default:
                throw new errors.NotImplementedError(`Not implemented formatting kind: ${formattingKind}`);
        }
    }
}
