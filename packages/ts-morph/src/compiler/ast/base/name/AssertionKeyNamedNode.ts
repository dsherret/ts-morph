import { ts } from "@ts-morph/common";
import { Constructor } from "../../../../types";
import { AssertionKey } from "../../aliases";
import { NamedNodeBase, NamedNodeBaseExtensionType, NamedNodeSpecificBase } from "./NamedNodeBase";
import { ReferenceFindableNode } from "./ReferenceFindableNode";
import { RenameableNode } from "./RenameableNode";

export type AssertionKeyNamedNodeExtensionType = NamedNodeBaseExtensionType<ts.AssertionKey>;

export interface AssertionKeyNamedNode extends AssertionKeyNamedNodeSpecific, ReferenceFindableNode, RenameableNode {
}

export type AssertionKeyNamedNodeSpecific = NamedNodeSpecificBase<AssertionKey>;

export function AssertionKeyNamedNode<T extends Constructor<AssertionKeyNamedNodeExtensionType>>(Base: T): Constructor<AssertionKeyNamedNode> & T {
  const base = ReferenceFindableNode(RenameableNode(Base));
  return NamedNodeBase<ts.AssertionKey, typeof base>(base);
}
