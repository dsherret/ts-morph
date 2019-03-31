import { Node } from "../../ast";
import { LanguageService } from "../LanguageService";
import { CodeFixAction } from "../results";

/**
 * Apply built-in TypeScript language service suggestion code fixes related to remove unused declarations, labels, etc.
 *
 * @param containerNode the node inside which to apply code fixes.
 * @param service a `LanguageService` instance.
 *
 * @internal
 */
export function removeUnusedDeclarations(containerNode: Node, service: LanguageService) {
    const codes = [6133, 7028, 6199, 6192];
    let fixes = getSuggestedCodeFixesInside();
    while (fixes && fixes.length) {
        // TODO: for some reason, we iterate until there are no more fixes in order to obtain an optimal
        // result (i.e. removeDeclarations). Investigate if there's something like combineCodeFixes or if we are missing
        // to pass extra code fix codes so we don't iterate.
        containerNode.getSourceFile().applyTextChanges(fixes[0].getChanges()[0].getTextChanges());
        fixes = getSuggestedCodeFixesInside();
    }
    return fixes;

    function getSuggestedCodeFixesInside() {
        const filePath = containerNode.getSourceFile().getFilePath();
        const diagnostics = service.getSuggestionDiagnostics(filePath)
            .map(d => {
                if (d.getStart() >= containerNode.getFullStart() && d.getStart() + d.getLength() <= containerNode.getEnd() && (!codes || codes.indexOf(d.getCode()) !== -1))
                    return service.getCodeFixesAtPosition(filePath, d.getStart(), d.getStart() + d.getLength(), [d.getCode()], {}, {});
                else
                    return undefined;
            })
            .filter(a => a && a.length) as CodeFixAction[][];
        return diagnostics.length ? diagnostics.reduce((a, b) => a.concat(b)) : [];
    }
}
