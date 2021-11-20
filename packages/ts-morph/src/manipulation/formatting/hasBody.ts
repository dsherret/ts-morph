import { Node } from "../../compiler";

export function hasBody(node: Node) {
  if (Node.isBodyable(node) && node.hasBody())
    return true;
  if (Node.isBodied(node))
    return true;

  return Node.isInterfaceDeclaration(node) || Node.isClassDeclaration(node) || Node.isEnumDeclaration(node);
}
