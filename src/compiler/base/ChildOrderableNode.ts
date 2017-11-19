import * as ts from "typescript";
import * as errors from "./../../errors";
import {changeChildOrder, getGeneralFormatting} from "./../../manipulation";
import {Constructor} from "./../../Constructor";
import {Node} from "./../common";

export interface ChildOrderableNode {
    /**
     * Sets the child index of the node within the parent.
     */
    setOrder(index: number): this;
}

export function ChildOrderableNode<T extends Constructor<Node>>(Base: T): Constructor<ChildOrderableNode> & T {
    return class extends Base implements ChildOrderableNode {
        setOrder(index: number) {
            const childIndex = this.getChildIndex();
            errors.throwIfOutOfRange(index, [0, this.getChildCount() - 1], nameof(index));

            if (childIndex === index)
                return this;

            changeChildOrder({
                parent: this.getParentSyntaxList() || this.getParentOrThrow(),
                getSiblingFormatting: getGeneralFormatting,
                oldIndex: childIndex,
                newIndex: index
            });
            return this;
        }
    };
}
