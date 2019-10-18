import { errors, SyntaxKind } from "@ts-morph/common";
import { StaticableNodeStructure } from "../../../structures";
import { Constructor } from "../../../types";
import { callBaseSet } from "../callBaseSet";
import { Node } from "../common";
import { ModifierableNode } from "./ModifierableNode";
import { callBaseGetStructure } from "../callBaseGetStructure";

export type StaticableNodeExtensionType = Node & ModifierableNode;

export interface StaticableNode {
    /**
     * Gets if it's static.
     */
    isStatic(): boolean;
    /**
     * Gets the static keyword, or undefined if none exists.
     */
    getStaticKeyword(): Node | undefined;
    /**
     * Gets the static keyword, or throws if none exists.
     */
    getStaticKeywordOrThrow(): Node;
    /**
     * Sets if the node is static.
     * @param value - If it should be static or not.
     */
    setIsStatic(value: boolean): this;
}

export function StaticableNode<T extends Constructor<StaticableNodeExtensionType>>(Base: T): Constructor<StaticableNode> & T {
    return class extends Base implements StaticableNode {
        isStatic() {
            return this.hasModifier(SyntaxKind.StaticKeyword);
        }

        getStaticKeyword() {
            return this.getFirstModifierByKind(SyntaxKind.StaticKeyword);
        }

        getStaticKeywordOrThrow() {
            return errors.throwIfNullOrUndefined(this.getStaticKeyword(), "Expected to find a static keyword.");
        }

        setIsStatic(value: boolean) {
            this.toggleModifier("static", value);
            return this;
        }

        set(structure: Partial<StaticableNodeStructure>) {
            callBaseSet(Base.prototype, this, structure);

            if (structure.isStatic != null)
                this.setIsStatic(structure.isStatic);

            return this;
        }

        getStructure() {
            return callBaseGetStructure<StaticableNodeStructure>(Base.prototype, this, {
                isStatic: this.isStatic()
            });
        }
    };
}
