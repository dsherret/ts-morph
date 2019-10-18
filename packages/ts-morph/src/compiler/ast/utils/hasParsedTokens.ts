import { ts } from "@ts-morph/common";

export function hasParsedTokens(node: ts.Node) {
    // if this is true, it means the compiler has previously parsed the tokens
    return (node as any)._children != null;
}
