import * as ts from "typescript";
import * as objectAssign from "object-assign";

/** String characters */
export enum StringChar {
    /** Double quote */
    DoubleQuote = "\"",
    /** Single quote */
    SingleQuote = "'"
}

/** Kinds of new lines */
export enum NewLineKind {
    /** Line feed */
    LineFeed = "\n",
    /** Carriage return and line feed */
    CarriageReturnLineFeed = "\r\n"
}

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
    /** Script target. */
    scriptTarget: ts.ScriptTarget;
    /** String char */
    stringChar: StringChar;
}

/**
 * Holds the manipulation settings.
 */
export class ManipulationSettingsContainer {
    private readonly settings: ManipulationSettings = {
        indentationText: IndentationText.FourSpaces,
        newLineKind: NewLineKind.LineFeed,
        scriptTarget: ts.ScriptTarget.Latest,
        stringChar: StringChar.DoubleQuote
    };

    /**
     * Gets the string character.
     */
    getStringChar() {
        return this.settings.stringChar;
    }

    /**
     * Gets the new line kind.
     */
    getNewLineKind() {
        return this.settings.newLineKind;
    }

    /**
     * Gets the indentation text;
     */
    getIndentationText() {
        return this.settings.indentationText;
    }

    /**
     * Gets the script target.
     */
    getScriptTarget() {
        return this.settings.scriptTarget;
    }

    /**
     * Sets one or all of the settings.
     * @param settings - Settings to set.
     */
    set(settings: Partial<ManipulationSettings>) {
        objectAssign(this.settings, settings);
    }
}
