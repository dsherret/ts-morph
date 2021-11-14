import { tsMorph } from "../deps.ts";

export function hasInternalDocTag(node: tsMorph.Node) {
  return tsMorph.Node.isJSDocableNode(node)
    && node.getJsDocs().some(d => d.getTags().some(t => t.getTagName() === "internal"));
}
