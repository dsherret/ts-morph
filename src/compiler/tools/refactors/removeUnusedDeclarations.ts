import { Node } from "../../ast";
import { LanguageService } from "../LanguageService";
import { CodeFixesContext, applyAllSuggestedCodeFixes } from "../../../../suggestionCodeFixes";

/**
 * Apply built-in TypeScript language service suggestion code fixes related to remove unused declarations, labels, etc.
 * 
 * @param containerNode the node inside which to apply code fixes.
 * @param service a `LanguageService` instance.
 */
export function removeUnusedDeclarations(containerNode: Node, service: LanguageService) {
    const sourceFile = containerNode.getSourceFile();
    // code fixes general functions need an object which is able to create/get source files, and provide a LanguageService.
    const context: CodeFixesContext = {
        createSourceFile: (filePath: string, text?: string) => sourceFile,
        getSourceFile: (filePath: string) => sourceFile,
        getLanguageService: () => service
    };
    return applyAllSuggestedCodeFixes(context, containerNode, [
        6133,
        7028,
        6199,
        6192 // All imports in import declaration are unused.
    ]);
}
