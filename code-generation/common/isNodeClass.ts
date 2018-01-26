import {ClassDeclaration} from "./../../src/compiler";
import {hasDescendantBaseType} from "./typeHelpers";

export function isNodeClass(classDec: ClassDeclaration) {
    return classDec.getBaseTypes().some(t => hasDescendantBaseType(t, checkingType => checkingType.getText() === "Node<NodeType>"));
}
