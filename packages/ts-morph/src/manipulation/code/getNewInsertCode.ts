import { Node } from "../../compiler";
import { FormattingKind, getFormattingKindText } from "../formatting";

export interface GetNewInsertCodeOptions<TNode extends Node, TStructure> {
    structures: ReadonlyArray<TStructure>;
    newCodes: string[];
    parent: Node;
    indentationText?: string;
    getSeparator(structure: TStructure, nextStructure: TStructure): FormattingKind;
    previousFormattingKind: FormattingKind;
    nextFormattingKind: FormattingKind;
}

// todo: seems like this should be renamed or removed?
export function getNewInsertCode<TNode extends Node, TStructure>(opts: GetNewInsertCodeOptions<TNode, TStructure>) {
    const { structures, newCodes, parent, getSeparator, previousFormattingKind, nextFormattingKind } = opts;
    const indentationText = opts.indentationText ?? parent.getChildIndentationText();
    const newLineKind = parent._context.manipulationSettings.getNewLineKindAsString();

    return getFormattingKindTextWithIndent(previousFormattingKind) + getChildCode() + getFormattingKindTextWithIndent(nextFormattingKind);

    function getChildCode() {
        let code = newCodes[0];
        for (let i = 1; i < newCodes.length; i++) {
            const formattingKind = getSeparator(structures[i - 1], structures[i]);
            code += getFormattingKindTextWithIndent(formattingKind);
            code += newCodes[i];
        }
        return code;
    }

    function getFormattingKindTextWithIndent(formattingKind: FormattingKind) {
        let code = getFormattingKindText(formattingKind, { newLineKind });
        if (formattingKind === FormattingKind.Newline || formattingKind === FormattingKind.Blankline)
            code += indentationText;
        return code;
    }
}
