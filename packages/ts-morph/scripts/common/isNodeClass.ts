import { tsMorph } from "@ts-morph/scripts";
import { hasDescendantNodeType } from "./typeHelpers";

export function isNodeClass(classDec: tsMorph.ClassDeclaration) {
    if (classDec.getName() === "Node")
        return true;
    return classDec.getBaseTypes().some(t => hasDescendantNodeType(t));
}
