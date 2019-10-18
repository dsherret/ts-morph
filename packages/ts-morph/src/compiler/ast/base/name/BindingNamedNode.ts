import { ts } from "@ts-morph/common";
import { Constructor } from "../../../../types";
import { BindingName } from "../../aliases";
import { ReferenceFindableNode } from "./ReferenceFindableNode";
import { RenameableNode } from "./RenameableNode";
import { NamedNodeBase, NamedNodeBaseExtensionType, NamedNodeSpecificBase } from "./NamedNodeBase";

export type BindingNamedNodeExtensionType = NamedNodeBaseExtensionType<ts.BindingName>;

export interface BindingNamedNode extends BindingNamedNodeSpecific, ReferenceFindableNode, RenameableNode {
}

export type BindingNamedNodeSpecific = NamedNodeSpecificBase<BindingName>;

export function BindingNamedNode<T extends Constructor<BindingNamedNodeExtensionType>>(Base: T): Constructor<BindingNamedNode> & T {
    const base = ReferenceFindableNode(RenameableNode(Base));
    return NamedNodeBase<ts.BindingName, typeof base>(base);
}
