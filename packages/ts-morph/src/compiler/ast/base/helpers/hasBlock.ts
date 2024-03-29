import { Node } from "../../common";

export function hasBlock(node: Node) {
  return Node.isClassDeclaration(node)
    || Node.isModuleDeclaration(node)
    || Node.isInterfaceDeclaration(node)
    || Node.isEnumDeclaration(node)
    || Node.hasBody(node);
}
