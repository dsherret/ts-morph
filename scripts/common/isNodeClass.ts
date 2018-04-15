import { ClassDeclaration } from "ts-simple-ast";
import { hasDescendantNodeType } from "./typeHelpers";

export function isNodeClass(classDec: ClassDeclaration) {
    if (classDec.getName() === "Node")
        return true;
    return classDec.getBaseTypes().some(t => hasDescendantNodeType(t));
}
