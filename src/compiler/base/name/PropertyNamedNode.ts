import { PropertyNamedNodeStructure } from "../../../structures";
import { Constructor } from "../../../types";
import { ts } from "../../../typescript";
import { PropertyName } from "../../aliases";
import { callBaseFill } from "../../callBaseFill";
import { Node } from "../../common";
import { ReferenceFindableNode } from "./ReferenceFindableNode";
import { RenameableNode } from "./RenameableNode";

export type PropertyNamedNodeExtensionType = Node<ts.Node & { name: ts.PropertyName; }>;

export interface PropertyNamedNode extends PropertyNamedNodeSpecific, ReferenceFindableNode, RenameableNode {
}

export interface PropertyNamedNodeSpecific {
    /**
     * Gets the name node.
     */
    getNameNode(): PropertyName;
    /**
     * Gets the text of the name of the node.
     */
    getName(): string;
}

export function PropertyNamedNode<T extends Constructor<PropertyNamedNodeExtensionType>>(Base: T): Constructor<PropertyNamedNode> & T {
    return PropertyNamedNodeInternal(ReferenceFindableNode(RenameableNode(Base)));
}

function PropertyNamedNodeInternal<T extends Constructor<PropertyNamedNodeExtensionType>>(Base: T): Constructor<PropertyNamedNodeSpecific> & T {
    return class extends Base implements PropertyNamedNodeSpecific {
        getNameNode() {
            return this.getNodeFromCompilerNode(this.compilerNode.name);
        }

        getName() {
            return this.getNameNode().getText();
        }

        fill(structure: Partial<PropertyNamedNodeStructure>) {
            callBaseFill(Base.prototype, this, structure);

            if (structure.name != null)
                (this as any as RenameableNode).rename(structure.name);

            return this;
        }
    };
}
