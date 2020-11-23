import { errors, ts } from "@ts-morph/common";
import { DotDotDotTokenableNode, JSDocableNode, NamedNode, QuestionTokenableNode, TypedNode } from "../base";
import { TypeNode } from "./TypeNode";

// Not sure how I feel about this having `removeType` and `getTypeNodeOrThrow` methods.
// I'm also reluctant to change `TypedNode`'s name at this point

const createBase = <T extends typeof TypeNode>(ctor: T) => TypedNode(QuestionTokenableNode(DotDotDotTokenableNode(JSDocableNode(NamedNode(ctor)))));
export const NamedTupleMemberBase = createBase(TypeNode);
/**
 * A named/labeled tuple element.
 *
 * Ex. `start: number` in `type Range = [start: number, end: number]`
 */
export class NamedTupleMember extends NamedTupleMemberBase<ts.NamedTupleMember> {
    /** Gets the named tuple type's type. */
    getTypeNode() {
        return super.getTypeNode()!; // will always have a value
    }

    /** Throws. This is not supported for NamedTupleMember. */
    removeType(): never {
        throw new errors.InvalidOperationError("Cannot remove the type of a named tuple member.");
    }
}
