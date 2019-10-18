import { ts } from "@ts-morph/common";
import { Constructor } from "../../../../types";
import { PropertyName } from "../../aliases";
import { ReferenceFindableNode } from "./ReferenceFindableNode";
import { RenameableNode } from "./RenameableNode";
import { NamedNodeBase, NamedNodeBaseExtensionType, NamedNodeSpecificBase } from "./NamedNodeBase";

export type PropertyNamedNodeExtensionType = NamedNodeBaseExtensionType<ts.PropertyName>;

export interface PropertyNamedNode extends PropertyNamedNodeSpecific, ReferenceFindableNode, RenameableNode {
}

export type PropertyNamedNodeSpecific = NamedNodeSpecificBase<PropertyName>;

export function PropertyNamedNode<T extends Constructor<PropertyNamedNodeExtensionType>>(Base: T): Constructor<PropertyNamedNode> & T {
    const base = ReferenceFindableNode(RenameableNode(Base));
    return NamedNodeBase<ts.PropertyName, typeof base>(base);
}
