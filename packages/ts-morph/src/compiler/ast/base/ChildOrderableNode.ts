import { errors } from "@ts-morph/common";
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
            const childIndex = this.getChildIndex();
            const parent = this.getParentSyntaxList() || this.getParentSyntaxListOrThrow();
            errors.throwIfOutOfRange(order, [0, parent.getChildCount() - 1], nameof(order));

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
