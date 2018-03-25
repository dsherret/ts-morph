import * as objectAssign from "object-assign";
import {ts, NewLineKind, EditorSettings} from "../typescript";
import {QuoteType} from "../compiler";
import {newLineKindToString, fillDefaultEditorSettings} from "../utils";
import {SettingsContainer} from "./SettingsContainer";

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
export interface ManipulationSettings {
    /** Indentation text */
    indentationText: IndentationText;
    /** New line kind */
    newLineKind: NewLineKind;
    /** Quote type used for string literals. */
    quoteType: QuoteType;
}

/**
 * Holds the manipulation settings.
 */
export class ManipulationSettingsContainer extends SettingsContainer<ManipulationSettings> {
    private editorSettings: EditorSettings | undefined;

    constructor() {
        super({
            indentationText: IndentationText.FourSpaces,
            newLineKind: NewLineKind.LineFeed,
            quoteType: QuoteType.Double
        });
    }

    /**
     * Gets the editor settings based on the current manipulation settings.
     */
    getEditorSettings() {
        if (this.editorSettings == null) {
            this.editorSettings = {};
            fillDefaultEditorSettings(this.editorSettings, this);
        }

        return this.editorSettings;
    }

    /**
     * Gets the quote type used for string literals.
     */
    getQuoteType() {
        return this.settings.quoteType;
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
    }
}
