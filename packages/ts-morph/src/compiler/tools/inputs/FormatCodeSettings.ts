import { ts } from "@ts-morph/common";

export interface FormatCodeSettings extends ts.FormatCodeSettings {
    ensureNewLineAtEndOfFile?: boolean;
}
