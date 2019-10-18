import { ts } from "../typescript";

/**
 * Gets the enum name for the specified syntax kind.
 * @param kind - Syntax kind.
 */
export function getSyntaxKindName(kind: ts.SyntaxKind) {
    return getKindCache()[kind];
}

let kindCache: { [kind: number]: string; } | undefined = undefined;

function getKindCache() {
    if (kindCache != null)
        return kindCache;
    kindCache = {};

    // some SyntaxKinds are repeated, so only use the first one
    for (const name of Object.keys(ts.SyntaxKind).filter(k => isNaN(parseInt(k, 10)))) {
        const value = (ts.SyntaxKind as any)[name] as number;
        if (kindCache[value] == null)
            kindCache[value] = name;
    }
    return kindCache;
}
