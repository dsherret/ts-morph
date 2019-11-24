import { Node } from "../../compiler";

export function hasBody(node: Node) {
    if (Node.isBodyableNode(node) && node.hasBody())
        return true;
    if (Node.isBodiedNode(node))
        return true;

    return Node.isInterfaceDeclaration(node) || Node.isClassDeclaration(node) || Node.isEnumDeclaration(node);
}
