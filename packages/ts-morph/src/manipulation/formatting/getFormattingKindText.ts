import { errors } from "@ts-morph/common";
import { FormattingKind } from "./FormattingKind";

export function getFormattingKindText(formattingKind: FormattingKind, opts: { newLineKind: string; }) {
    switch (formattingKind) {
        case FormattingKind.Space:
            return " ";
        case FormattingKind.Newline:
            return opts.newLineKind;
        case FormattingKind.Blankline:
            return opts.newLineKind + opts.newLineKind;
        case FormattingKind.None:
            return "";
        default:
            throw new errors.NotImplementedError(`Not implemented formatting kind: ${formattingKind}`);
    }
}
