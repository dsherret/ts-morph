import { ts } from "@ts-morph/common";
import { Node } from "../../compiler";

export function isNodeAmbientOrInAmbientContext(node: Node) {
    if (checkNodeIsAmbient(node) || node._sourceFile.isDeclarationFile())
        return true;

    for (const ancestor of node._getAncestorsIterator(false)) {
        if (checkNodeIsAmbient(ancestor))
            return true;
    }

    return false;
}

function checkNodeIsAmbient(node: Node) {
    const isThisAmbient = (node.getCombinedModifierFlags() & ts.ModifierFlags.Ambient) === ts.ModifierFlags.Ambient;
    return isThisAmbient || Node.isInterfaceDeclaration(node) || Node.isTypeAliasDeclaration(node);
}
