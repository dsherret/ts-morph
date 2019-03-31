import * as ts from "typescript";
import { ArrayUtils } from "../../../utils";
import { Node, SourceFile } from "../../ast";
import { LanguageService } from "../LanguageService";
import { TextChange } from "../../tools/results";

/**
 * Apply suggested code fixes like the ones returned by (`LanguageService#getSuggestionDiagnostics()`) to given `containerNode`.
 * Code fixes are given in `codes` or if not provided, all language service suggestions will be applied.
 *
 * @param context an object capable of providing the LanguageService instance, creating and obtaining project's source files.
 * @param containerNode the node inside which to apply code fixes.
 * @param codes code fixes codes to apply. If not provided all language service suggestions code fixes that apply to
 * `containerNode` will be applied.
 *
 * @internal
 */
export function applyAllSuggestedCodeFixes(context: CodeFixesContext, containerNode: Node, codes?: number[]) {
    const service = context.getLanguageService().compilerObject;
    let fixes = getSuggestedCodeFixesInside(service, containerNode, codes);
    while (fixes && fixes.length) {
        // TODO: for some reason, we really need to iterate until there are no more fixes in order to obtain an optimal
        // result (i.e. removeDeclarations). Investigate if there's something like combineCodeFixes or if we are missing
        // to pass extra code fix codes so we don't iterate.
        applyFileTextChanges(context, fixes[0].changes[0]);
        fixes = getSuggestedCodeFixesInside(service, containerNode, codes);
    }
}

function applyFileTextChanges(context: CodeFixesContext, fileTextChanges: ts.FileTextChanges) {
    let file = context.getSourceFile(fileTextChanges.fileName);
    if (fileTextChanges.isNewFile && file)
        throw new Error(`FileTextChanges instructed to create file "${file}" but it already exists on the project. Aborting!`);
    if (!file && !fileTextChanges.isNewFile)
        throw new Error(`FileTextChanges instructed to modify existing file "${file}" but it doesn't exist. Refusing to create it. Aborting!`);
    if (!file)
        file = context.createSourceFile(fileTextChanges.fileName);
    file.applyTextChanges(fileTextChanges.textChanges.map(compilerNode => new TextChange(compilerNode)));
}

function getSuggestedCodeFixesInside(service: ts.LanguageService, containerNode: Node, codes?: number[]) {
    // TODO: see if it's possible to use ts-morph LanguageService instead compilerObject
    const filePath = containerNode.getSourceFile().getFilePath();
    const diagnostics = service.getSuggestionDiagnostics(filePath)
        .map(d => {
            if (d.start >= containerNode.getFullStart() && d.start + d.length <= containerNode.getEnd() && (!codes || codes.indexOf(d.code) !== -1))
                return service.getCodeFixesAtPosition(filePath, d.start, d.start + d.length, [d.code], {}, {});
            else
                return undefined;
        })
        .filter(a => a && a.length);
    return ArrayUtils.flattenReadOnlyArray(diagnostics.filter(ArrayUtils.isNotUndefined));
}

interface CodeFixesContext {
    createSourceFile(filePath: string, text?: string): SourceFile;
    getSourceFile(filePath: string): SourceFile | undefined;
    getLanguageService(): LanguageService;
}
