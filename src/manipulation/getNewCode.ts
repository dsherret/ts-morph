import {Node} from "./../compiler";
import * as errors from "./../errors";
import {Formatting, FormattingKind} from "./../manipulation/formatting/Formatting";

export interface GetNewCodeOptions<TNode extends Node, TStructure> {
    structures: TStructure[];
    newCodes: string[];
    parent: Node;
    children: TNode[];
    index: number;
    formatting: Formatting<TNode, TStructure>;
    indentationText?: string;
}

export function getNewCode<TNode extends Node, TStructure>(opts: GetNewCodeOptions<TNode, TStructure>) {
    const {structures, newCodes, children, index, formatting, parent} = opts;
    const indentationText = opts.indentationText || parent.getChildIndentationText();
    const newLineChar = parent.global.manipulationSettings.getNewLineKind();

    return getPrefixCode() + getChildCode() + getSuffixCode();

    function getPrefixCode() {
        if (index === 0)
            return "";
        const previousChild = children[index - 1];
        return getFormattingKindTextWithIndent(formatting.getPrevious(structures[0], previousChild));
    }

    function getChildCode() {
        let code = newCodes[0];
        for (let i = 1; i < newCodes.length; i++) {
            const formattingKind = formatting.getSeparator(parent, structures[i - 1], structures[i]);
            code += getFormattingKindTextWithIndent(formattingKind);
            code += newCodes[i];
        }
        return code;
    }

    function getSuffixCode() {
        if (index >= children.length)
            return "";
        const nextChild = children[index];
        return getFormattingKindTextWithIndent(formatting.getNext(structures[structures.length - 1], nextChild));
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
