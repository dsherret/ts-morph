import { PropertyNamedNodeStructure } from "../../../structures";
import { Constructor } from "../../../types";
import { ts } from "../../../typescript";
import { PropertyName } from "../../aliases";
import { callBaseFill } from "../../callBaseFill";
import { Node } from "../../common";
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
