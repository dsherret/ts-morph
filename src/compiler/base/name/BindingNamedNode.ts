import * as errors from "../../../errors";
import { Constructor } from "../../../types";
import { SyntaxKind, ts } from "../../../typescript";
import { Identifier, Node } from "../../common";
import { ReferenceFindableNode } from "./ReferenceFindableNode";
import { RenameableNode } from "./RenameableNode";
import { NamedNodeBase, NamedNodeBaseExtensionType, NamedNodeSpecificBase } from "./NamedNodeBase";

// todo: should use ts.BindingName here

export type BindingNamedNodeExtensionType = NamedNodeBaseExtensionType<ts.Identifier>;

export interface BindingNamedNode extends BindingNamedNodeSpecific, ReferenceFindableNode, RenameableNode {
}

export type BindingNamedNodeSpecific = NamedNodeSpecificBase<Identifier>;

export function BindingNamedNode<T extends Constructor<BindingNamedNodeExtensionType>>(Base: T): Constructor<BindingNamedNode> & T {
    const base = ReferenceFindableNode(RenameableNode(Base));
    return NamedNodeBase<ts.Identifier, typeof base>(base);
}
