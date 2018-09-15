import { Node, TypeGuards } from "ts-simple-ast";

export function hasInternalDocTag(node: Node) {
    return TypeGuards.isJSDocableNode(node)
        && node.getJsDocs().some(d => d.getTags().some(t => t.getName() === "internal"));
}
