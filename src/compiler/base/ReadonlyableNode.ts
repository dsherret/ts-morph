import * as errors from "../../errors";
import { ReadonlyableNodeStructure } from "../../structures";
import { Constructor } from "../../types";
import { SyntaxKind } from "../../typescript";
import { callBaseFill } from "../callBaseFill";
import { Node } from "../common";
import { ModifierableNode } from "./ModifierableNode";
import { callBaseGetStructure } from '../callBaseGetStructure';

export type ReadonlyableNodeExtensionType = Node & ModifierableNode;

export interface ReadonlyableNode {
    /**
     * Gets if it's readonly.
     */
    isReadonly(): boolean;
    /**
     * Gets the readonly keyword, or undefined if none exists.
     */
    getReadonlyKeyword(): Node | undefined;
    /**
     * Gets the readonly keyword, or throws if none exists.
     */
    getReadonlyKeywordOrThrow(): Node;
    /**
     * Sets if this node is readonly.
     * @param value - If readonly or not.
     */
    setIsReadonly(value: boolean): this;

    getStructure(): ReadonlyableNodeStructure;
}

export function ReadonlyableNode<T extends Constructor<ReadonlyableNodeExtensionType>>(Base: T): Constructor<ReadonlyableNode> & T {
    return class extends Base implements ReadonlyableNode {
        isReadonly() {
            return this.getReadonlyKeyword() != null;
        }

        getReadonlyKeyword() {
            return this.getFirstModifierByKind(SyntaxKind.ReadonlyKeyword);
        }

        getReadonlyKeywordOrThrow() {
            return errors.throwIfNullOrUndefined(this.getReadonlyKeyword(), "Expected to find a readonly keyword.");
        }

        setIsReadonly(value: boolean) {
            this.toggleModifier("readonly", value);
            return this;
        }

        fill(structure: Partial<ReadonlyableNodeStructure>) {
            callBaseFill(Base.prototype, this, structure);

            if (structure.isReadonly != null)
                this.setIsReadonly(structure.isReadonly);

            return this;
        }

        //TODO - Note : I think ReadonlyableNode and ReadonlyableNodeStructure intersects with ModifierableNode and its structure - readonly is also there! ingeneral this information is repeated in both places. 
        getStructure(): ReadonlyableNodeStructure {
            return callBaseGetStructure<ReadonlyableNodeStructure>(Base.prototype, this, {
                isReadonly: this.isReadonly()
            });
        }
    };
}
