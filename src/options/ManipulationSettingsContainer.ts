import { QuoteKind, UserPreferences } from "../compiler";
import * as errors from "../errors";
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
    private _editorSettings: EditorSettings | undefined;
    private _formatCodeSettings: SupportedFormatCodeSettings | undefined;
    private _userPreferences: UserPreferences | undefined;

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
        if (this._editorSettings == null) {
            this._editorSettings = {};
            fillDefaultEditorSettings(this._editorSettings, this);
        }

        return {...this._editorSettings};
    }

    /**
     * Gets the format code settings.
     */
    getFormatCodeSettings(): Readonly<SupportedFormatCodeSettings> {
        if (this._formatCodeSettings == null) {
            this._formatCodeSettings = {
                ...this.getEditorSettings(),
                insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: this._settings.insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces
            };
        }

        return {...this._formatCodeSettings};
    }

    /**
     * Gets the user preferences.
     */
    getUserPreferences(): Readonly<UserPreferences> {
        if (this._userPreferences == null) {
            this._userPreferences = {
                quotePreference: this.getQuoteKind() === QuoteKind.Double ? "double" : "single"
            };
        }
        return { ...this._userPreferences };
    }

    /**
     * Gets the quote kind used for string literals.
     */
    getQuoteKind() {
        return this._settings.quoteKind;
    }

    /**
     * Gets the new line kind.
     */
    getNewLineKind() {
        return this._settings.newLineKind;
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
        return this._settings.indentationText;
    }

    /**
     * Sets one or all of the settings.
     * @param settings - Settings to set.
     */
    set(settings: Partial<ManipulationSettings>) {
        super.set(settings);
        this._editorSettings = undefined;
        this._formatCodeSettings = undefined;
        this._userPreferences = undefined;
    }

    /**
     * @internal
     * Gets the indent size as represented in spaces.
     */
    _getIndentSizeInSpaces() {
        const indentationText = this.getIndentationText();
        switch (indentationText) {
            case IndentationText.EightSpaces:
                return 8;
            case IndentationText.FourSpaces:
                return 4;
            case IndentationText.TwoSpaces:
                return 2;
            case IndentationText.Tab:
                return 4; // most common
            default:
                return errors.throwNotImplementedForNeverValueError(indentationText);
        }
    }
}
