import { errors, SyntaxKind } from "@ts-morph/common";
import { AmbientableNodeStructure } from "../../../structures";
import { Constructor } from "../../../types";
import { isNodeAmbientOrInAmbientContext } from "../../../utils";
import { callBaseSet } from "../callBaseSet";
import { Node } from "../common";
import { ModifierableNode } from "./ModifierableNode";
import { callBaseGetStructure } from "../callBaseGetStructure";

export type AmbientableNodeExtensionType = Node & ModifierableNode;

export interface AmbientableNode {
    /**
     * If the node has the declare keyword.
     */
    hasDeclareKeyword(): boolean;
    /**
     * Gets the declare keyword or undefined if none exists.
     */
    getDeclareKeyword(): Node | undefined;
    /**
     * Gets the declare keyword or throws if it doesn't exist.
     */
    getDeclareKeywordOrThrow(): Node;
    /**
     * Gets if the node is ambient.
     */
    isAmbient(): boolean;
    /**
     * Sets if this node has a declare keyword.
     * @param value - To add the declare keyword or not.
     */
    setHasDeclareKeyword(value?: boolean): this;
}

export function AmbientableNode<T extends Constructor<AmbientableNodeExtensionType>>(Base: T): Constructor<AmbientableNode> & T {
    return class extends Base implements AmbientableNode {
        hasDeclareKeyword() {
            return this.getDeclareKeyword() != null;
        }

        getDeclareKeywordOrThrow() {
            return errors.throwIfNullOrUndefined(this.getDeclareKeyword(), "Expected to find a declare keyword.");
        }

        getDeclareKeyword() {
            return this.getFirstModifierByKind(SyntaxKind.DeclareKeyword);
        }

        isAmbient() {
            return isNodeAmbientOrInAmbientContext(this);
        }

        setHasDeclareKeyword(value: boolean) {
            this.toggleModifier("declare", value);
            return this;
        }

        set(structure: Partial<AmbientableNodeStructure>) {
            callBaseSet(Base.prototype, this, structure);

            if (structure.hasDeclareKeyword != null)
                this.setHasDeclareKeyword(structure.hasDeclareKeyword);

            return this;
        }

        getStructure() {
            return callBaseGetStructure<AmbientableNodeStructure>(Base.prototype, this, {
                hasDeclareKeyword: this.hasDeclareKeyword()
            });
        }
    };
}
