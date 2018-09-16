import { Node } from "../../common";
import { TypeGuards } from "../../../utils";

export function hasBlock(node: Node) {
    return TypeGuards.isClassDeclaration(node)
        || TypeGuards.isNamespaceDeclaration(node)
        || TypeGuards.isInterfaceDeclaration(node)
        || TypeGuards.isEnumDeclaration(node)
        || TypeGuards.hasBody(node);
}
