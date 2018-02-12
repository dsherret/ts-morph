import * as ts from "typescript";
import * as objectAssign from "object-assign";
import {QuoteType} from "./compiler";

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
    /** Quote type used for string literals. */
    quoteType: QuoteType;
}

/**
 * Holds the manipulation settings.
 */
export class ManipulationSettingsContainer {
    private readonly settings: ManipulationSettings = {
        indentationText: IndentationText.FourSpaces,
        newLineKind: NewLineKind.LineFeed,
        scriptTarget: ts.ScriptTarget.Latest,
        quoteType: QuoteType.Double
    };

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
     * Gets a copy of the manipulations settings as an object.
     */
    get(): ManipulationSettings {
        return {...this.settings};
    }

    /**
     * Sets one or all of the settings.
     * @param settings - Settings to set.
     */
    set(settings: Partial<ManipulationSettings>) {
        objectAssign(this.settings, settings);
    }
}
