import { ts } from "@ts-morph/common";
import { Constructor } from "../../../../types";
import { ModuleName } from "../../aliases";
import { NamedNodeBase, NamedNodeBaseExtensionType, NamedNodeSpecificBase } from "./NamedNodeBase";
import { ReferenceFindableNode } from "./ReferenceFindableNode";
import { RenameableNode } from "./RenameableNode";

export type ModuleNamedNodeExtensionType = NamedNodeBaseExtensionType<ts.ModuleName>;

export interface ModuleNamedNode extends ModuleNamedNodeSpecific, ReferenceFindableNode, RenameableNode {
}

export type ModuleNamedNodeSpecific = NamedNodeSpecificBase<ModuleName>;

export function ModuleNamedNode<T extends Constructor<ModuleNamedNodeExtensionType>>(Base: T): Constructor<ModuleNamedNode> & T {
    const base = ReferenceFindableNode(RenameableNode(Base));
    return NamedNodeBase<ts.ModuleName, typeof base>(base);
}
