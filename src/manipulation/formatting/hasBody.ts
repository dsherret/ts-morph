import { Node } from "../../compiler";
import { TypeGuards } from "../../utils";

export function hasBody(node: Node) {
    if (TypeGuards.isBodyableNode(node) && node.hasBody())
        return true;
    if (TypeGuards.isBodiedNode(node))
        return true;

    return TypeGuards.isInterfaceDeclaration(node) || TypeGuards.isClassDeclaration(node) || TypeGuards.isEnumDeclaration(node);
}
