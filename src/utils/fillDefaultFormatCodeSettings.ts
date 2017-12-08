import * as ts from "typescript";
import {ManipulationSettingsContainer, IndentationText} from "./../ManipulationSettings";
import {FormatCodeSettings} from "./../compiler";

export function fillDefaultFormatCodeSettings(settings: FormatCodeSettings, manipulationSettings: ManipulationSettingsContainer) {
    setValueIfUndefined(settings, "convertTabsToSpaces", manipulationSettings.getIndentationText() !== IndentationText.Tab);
    setValueIfUndefined(settings, "insertSpaceAfterCommaDelimiter", true);
    setValueIfUndefined(settings, "insertSpaceAfterConstructor", false);
    setValueIfUndefined(settings, "insertSpaceAfterSemicolonInForStatements", false);
    setValueIfUndefined(settings, "insertSpaceAfterKeywordsInControlFlowStatements", true);
    setValueIfUndefined(settings, "insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces", false);
    setValueIfUndefined(settings, "insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets", false);
    setValueIfUndefined(settings, "insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces", false);
    setValueIfUndefined(settings, "insertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces", false);
    setValueIfUndefined(settings, "insertSpaceBeforeFunctionParenthesis", false);
    setValueIfUndefined(settings, "insertSpaceAfterSemicolonInForStatements", true);
    setValueIfUndefined(settings, "insertSpaceBeforeAndAfterBinaryOperators", true);
    setValueIfUndefined(settings, "newLineCharacter", manipulationSettings.getNewLineKind());
    setValueIfUndefined(settings, "indentStyle", ts.IndentStyle.Smart);
    setValueIfUndefined(settings, "indentSize", manipulationSettings.getIndentationText().length);
    setValueIfUndefined(settings, "placeOpenBraceOnNewLineForFunctions", false);
    setValueIfUndefined(settings, "placeOpenBraceOnNewLineForControlBlocks", false);
    setValueIfUndefined(settings, "tabSize", manipulationSettings.getIndentationText().length);
    setValueIfUndefined(settings, "ensureNewLineAtEndOfFile", true);
}

function setValueIfUndefined<T, U extends keyof T>(obj: T, propertyName: U, defaultValue: T[U]) {
    if (typeof obj[propertyName] === "undefined")
        obj[propertyName] = defaultValue;
}
