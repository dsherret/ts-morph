import { EditorSettings, errors, NewLineKind, SettingsContainer } from "@ts-morph/common";
import { QuoteKind, UserPreferences } from "../compiler";
import { fillDefaultEditorSettings, newLineKindToString } from "../utils";

/** Kinds of indentation */
export enum IndentationText {
  /** Two spaces */
  TwoSpaces = "  ",
  /** Four spaces */
  FourSpaces = "    ",
  /** Eight spaces */
  EightSpaces = "        ",
  /** Tab */
  Tab = "\t",
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
  /**
   * Whether to enable renaming shorthand property assignments, binding elements,
   * and import & export specifiers without changing behaviour.
   * @remarks Defaults to true.
   * This setting is only available when using TypeScript 3.4+.
   */
  usePrefixAndSuffixTextForRename: boolean;
  /** Whether to use trailing commas when inserting or removing nodes. */
  useTrailingCommas: boolean;
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
   * @remarks Defaults to true.
   */
  insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: boolean;
}

/**
 * Holds the manipulation settings.
 */
export class ManipulationSettingsContainer extends SettingsContainer<ManipulationSettings> {
  #editorSettings: EditorSettings | undefined;
  #formatCodeSettings: SupportedFormatCodeSettings | undefined;
  #userPreferences: UserPreferences | undefined;

  constructor() {
    super({
      indentationText: IndentationText.FourSpaces,
      newLineKind: NewLineKind.LineFeed,
      quoteKind: QuoteKind.Double,
      insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: true,
      usePrefixAndSuffixTextForRename: false,
      useTrailingCommas: false,
    });
  }

  /**
   * Gets the editor settings based on the current manipulation settings.
   */
  getEditorSettings(): Readonly<EditorSettings> {
    if (this.#editorSettings == null) {
      this.#editorSettings = {};
      fillDefaultEditorSettings(this.#editorSettings, this);
    }

    return { ...this.#editorSettings };
  }

  /**
   * Gets the format code settings.
   */
  getFormatCodeSettings(): Readonly<SupportedFormatCodeSettings> {
    if (this.#formatCodeSettings == null) {
      this.#formatCodeSettings = {
        ...this.getEditorSettings(),
        insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: this._settings.insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces,
      };
    }

    return { ...this.#formatCodeSettings };
  }

  /**
   * Gets the user preferences.
   */
  getUserPreferences(): Readonly<UserPreferences> {
    if (this.#userPreferences == null) {
      this.#userPreferences = {
        quotePreference: this.getQuoteKind() === QuoteKind.Double ? "double" : "single",
        providePrefixAndSuffixTextForRename: this.getUsePrefixAndSuffixTextForRename(),
      };
    }
    return { ...this.#userPreferences };
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
   * Gets the indentation text.
   */
  getIndentationText() {
    return this._settings.indentationText;
  }

  /**
   * Gets whether to use prefix and suffix text when renaming.
   */
  getUsePrefixAndSuffixTextForRename() {
    return this._settings.usePrefixAndSuffixTextForRename;
  }

  /**
   * Gets whether trailing commas should be used.
   */
  getUseTrailingCommas() {
    return this._settings.useTrailingCommas;
  }

  /**
   * Sets one or all of the settings.
   * @param settings - Settings to set.
   */
  set(settings: Partial<ManipulationSettings>) {
    super.set(settings);
    this.#editorSettings = undefined;
    this.#formatCodeSettings = undefined;
    this.#userPreferences = undefined;
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
