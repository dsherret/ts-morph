import { QuoteKind, UserPreferences } from "../compiler";
import { EditorSettings, NewLineKind } from "../typescript";
import { fillDefaultEditorSettings, newLineKindToString } from "../utils";
import { SettingsContainer } from "./SettingsContainer";

/** Kinds of indentation */
export enum IndentationText {
    /** Two spaces */
    TwoSpaces = "  ",
    /** Four spaces */
    FourSpaces = "    ",
    /** Eight spaces */
    EightSpaces = "        ",
    /** Tab */
    Tab = "\t"
}

/**
 * Manipulation settings.
 */
export interface ManipulationSettings extends SupportedFormatCodeSettingsOnly {
    /** Indentation text */
    indentationText: IndentationText;
    /** New line kind */
    newLineKind: NewLineKind;
    /** Quote type used for string literals. */
    quoteKind: QuoteKind;
}

/**
 * FormatCodeSettings that are currently supported in the library.
 */
export interface SupportedFormatCodeSettings extends SupportedFormatCodeSettingsOnly, EditorSettings {
}

/**
 * FormatCodeSettings that are currently supported in the library.
 */
export interface SupportedFormatCodeSettingsOnly {
    /**
     * Whether to insert a space after opening and before closing non-empty braces.
     *
     * ex. `import { Item } from "./Item";` or `import {Item} from "./Item";`
     */
    insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: boolean;
}

/**
 * Holds the manipulation settings.
 */
export class ManipulationSettingsContainer extends SettingsContainer<ManipulationSettings> {
    private editorSettings: EditorSettings | undefined;
    private formatCodeSettings: SupportedFormatCodeSettings | undefined;
    private userPreferences: UserPreferences | undefined;

    constructor() {
        super({
            indentationText: IndentationText.FourSpaces,
            newLineKind: NewLineKind.LineFeed,
            quoteKind: QuoteKind.Double,
            insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: true
        });
    }

    /**
     * Gets the editor settings based on the current manipulation settings.
     */
    getEditorSettings(): Readonly<EditorSettings> {
        if (this.editorSettings == null) {
            this.editorSettings = {};
            fillDefaultEditorSettings(this.editorSettings, this);
        }

        return {...this.editorSettings};
    }

    /**
     * Gets the format code settings.
     */
    getFormatCodeSettings(): Readonly<SupportedFormatCodeSettings> {
        if (this.formatCodeSettings == null) {
            this.formatCodeSettings = {
                ...this.getEditorSettings(),
                insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: this.settings.insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces
            };
        }

        return {...this.formatCodeSettings};
    }

    /**
     * Gets the user preferences.
     */
    getUserPreferences(): Readonly<UserPreferences> {
        if (this.userPreferences == null) {
            this.userPreferences = {
                quotePreference: this.getQuoteKind() === QuoteKind.Double ? "double" : "single"
            };
        }
        return { ...this.userPreferences };
    }

    /**
     * Gets the quote kind used for string literals.
     */
    getQuoteKind() {
        return this.settings.quoteKind;
    }

    /**
     * Gets the new line kind.
     */
    getNewLineKind() {
        return this.settings.newLineKind;
    }

    /**
     * Gets the new line kind as a string.
     */
    getNewLineKindAsString() {
        return newLineKindToString(this.getNewLineKind());
    }

    /**
     * Gets the indentation text;
     */
    getIndentationText() {
        return this.settings.indentationText;
    }

    /**
     * Sets one or all of the settings.
     * @param settings - Settings to set.
     */
    set(settings: Partial<ManipulationSettings>) {
        super.set(settings);
        this.editorSettings = undefined;
        this.formatCodeSettings = undefined;
        this.userPreferences = undefined;
    }
}
