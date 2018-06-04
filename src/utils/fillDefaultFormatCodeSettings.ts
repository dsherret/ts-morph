import { FormatCodeSettings } from "../compiler";
import { ManipulationSettingsContainer } from "../options";
import { fillDefaultEditorSettings } from "./fillDefaultEditorSettings";
import { setValueIfUndefined } from "./setValueIfUndefined";

export function fillDefaultFormatCodeSettings(settings: FormatCodeSettings, manipulationSettings: ManipulationSettingsContainer) {
    fillDefaultEditorSettings(settings, manipulationSettings);
    setValueIfUndefined(settings, "insertSpaceAfterCommaDelimiter", true);
    setValueIfUndefined(settings, "insertSpaceAfterConstructor", false);
    setValueIfUndefined(settings, "insertSpaceAfterSemicolonInForStatements", true);
    setValueIfUndefined(settings, "insertSpaceAfterKeywordsInControlFlowStatements", true);
    setValueIfUndefined(settings, "insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces", true);
    setValueIfUndefined(settings, "insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets", false);
    setValueIfUndefined(settings, "insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces", false);
    setValueIfUndefined(settings, "insertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces", false);
    setValueIfUndefined(settings, "insertSpaceBeforeFunctionParenthesis", false);
    setValueIfUndefined(settings, "insertSpaceBeforeAndAfterBinaryOperators", true);
    setValueIfUndefined(settings, "placeOpenBraceOnNewLineForFunctions", false);
    setValueIfUndefined(settings, "placeOpenBraceOnNewLineForControlBlocks", false);
    setValueIfUndefined(settings, "ensureNewLineAtEndOfFile", true);
}
