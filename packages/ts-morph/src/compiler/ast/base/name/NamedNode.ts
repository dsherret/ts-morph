import { ts } from "@ts-morph/common";
import { Constructor } from "../../../../types";
import { Identifier } from "../../name";
import { ReferenceFindableNode } from "./ReferenceFindableNode";
import { RenameableNode } from "./RenameableNode";
import { NamedNodeBase, NamedNodeBaseExtensionType, NamedNodeSpecificBase } from "./NamedNodeBase";

// todo: make name optional, but in a different class because TypeParameterDeclaration expects a name
// (maybe NameableNode and rename some of the other "-ed" classes)
export type NamedNodeExtensionType = NamedNodeBaseExtensionType<ts.Identifier>;

export interface NamedNode extends NamedNodeSpecific, ReferenceFindableNode, RenameableNode {
}

export type NamedNodeSpecific = NamedNodeSpecificBase<Identifier>;

export function NamedNode<T extends Constructor<NamedNodeExtensionType>>(Base: T): Constructor<NamedNode> & T {
    const base = RenameableNode(ReferenceFindableNode(Base));
    return NamedNodeBase<ts.Identifier, typeof base>(base);
}
