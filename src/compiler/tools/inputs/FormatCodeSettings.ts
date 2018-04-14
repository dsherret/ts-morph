import { ts } from "../../../typescript";

export interface FormatCodeSettings extends ts.FormatCodeSettings {
    ensureNewLineAtEndOfFile?: boolean;
}
