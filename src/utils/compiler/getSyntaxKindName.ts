import { SyntaxKind } from "../../typescript";

export function getSyntaxKindName(kind: SyntaxKind) {
    return getKindCache()[kind];
}

let kindCache: { [kind: number]: string; } | undefined = undefined;

function getKindCache() {
    if (kindCache != null)
        return kindCache;
    kindCache = {};

    // some SyntaxKinds are repeated, so only use the first one
    for (const name of Object.keys(SyntaxKind).filter(k => isNaN(parseInt(k, 10)))) {
        const value = (SyntaxKind as any)[name] as number;
        if (kindCache[value] == null)
            kindCache[value] = name;
    }
    return kindCache;
}
