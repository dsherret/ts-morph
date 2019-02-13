import { Node, TypeGuards } from "ts-morph";

export function hasInternalDocTag(node: Node) {
    return TypeGuards.isJSDocableNode(node)
        && node.getJsDocs().some(d => d.getTags().some(t => t.getTagName() === "internal"));
}
