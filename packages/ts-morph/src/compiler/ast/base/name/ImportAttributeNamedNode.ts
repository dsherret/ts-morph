import { ts } from "@ts-morph/common";
import { Constructor } from "../../../../types";
import { AssertionKey } from "../../aliases";
import { NamedNodeBase, NamedNodeBaseExtensionType, NamedNodeSpecificBase } from "./NamedNodeBase";
import { ReferenceFindableNode } from "./ReferenceFindableNode";
import { RenameableNode } from "./RenameableNode";

export type ImportAttributeNamedNodeExtensionType = NamedNodeBaseExtensionType<ts.ImportAttributeName>;

export interface ImportAttributeNamedNode extends ImportAttributeNamedNodeSpecific, ReferenceFindableNode, RenameableNode {
}

export type ImportAttributeNamedNodeSpecific = NamedNodeSpecificBase<AssertionKey>;

export function ImportAttributeNamedNode<T extends Constructor<ImportAttributeNamedNodeExtensionType>>(Base: T): Constructor<ImportAttributeNamedNode> & T {
  const base = ReferenceFindableNode(RenameableNode(Base));
  return NamedNodeBase<ts.ImportAttributeName, typeof base>(base);
}
