import * as ts from "typescript";
import {Constructor} from "./../../Constructor";
import {StaticableNodeStructure} from "./../../structures";
import {callBaseFill} from "./../callBaseFill";
import {Node} from "./../common";
import {ModifierableNode} from "./ModifierableNode";

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
     * Sets if the node is static.
     * @param value - If it should be static or not.
     */
    setIsStatic(value: boolean): this;
}

export function StaticableNode<T extends Constructor<StaticableNodeExtensionType>>(Base: T): Constructor<StaticableNode> & T {
    return class extends Base implements StaticableNode {
        isStatic() {
            return this.hasModifier(ts.SyntaxKind.StaticKeyword);
        }

        getStaticKeyword() {
            return this.getFirstModifierByKind(ts.SyntaxKind.StaticKeyword);
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
