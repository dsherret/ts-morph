import * as errors from "../../../errors";
import { changeChildOrder, getGeneralFormatting } from "../../../manipulation";
import { Constructor } from "../../../types";
import { Node } from "../common";

export type ChildOrderableNodeExtensionType = Node;

export interface ChildOrderableNode {
    /**
     * Sets the child order of the node within the parent.
     */
    setOrder(order: number): this;
}

export function ChildOrderableNode<T extends Constructor<ChildOrderableNodeExtensionType>>(Base: T): Constructor<ChildOrderableNode> & T {
    return class extends Base implements ChildOrderableNode {
        setOrder(order: number) {
            const parent = this.getParentSyntaxList() || this.getParentSyntaxListOrThrow();
            const children = parent._getCompilerExtendedParserChildren();
            const childIndex = children.indexOf(this.compilerNode);
            errors.throwIfOutOfRange(order, [0, children.length - 1], nameof(order));

            if (childIndex === order)
                return this;

            changeChildOrder({
                parent,
                getSiblingFormatting: getGeneralFormatting,
                oldIndex: childIndex,
                newIndex: order
            });
            return this;
        }
    };
}
