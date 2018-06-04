import * as errors from "../../errors";
import { StaticableNodeStructure } from "../../structures";
import { Constructor } from "../../types";
import { SyntaxKind } from "../../typescript";
import { callBaseFill } from "../callBaseFill";
import { Node } from "../common";
import { ModifierableNode } from "./ModifierableNode";

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

        fill(structure: Partial<StaticableNodeStructure>) {
            callBaseFill(Base.prototype, this, structure);

            if (structure.isStatic != null)
                this.setIsStatic(structure.isStatic);

            return this;
        }
    };
}
