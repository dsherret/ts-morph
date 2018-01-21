import {ClassDeclaration} from "./../../src/compiler";
import {hasDescendantBaseType} from "./hasDescendantBaseType";

export function isNodeClass(classDec: ClassDeclaration) {
    return classDec.getBaseTypes().some(t => hasDescendantBaseType(t, checkingType => checkingType.getText() === "Node<NodeType>"));
}
