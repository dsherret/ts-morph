import * as errors from "../../../errors";
import { AbstractableNodeStructure } from "../../../structures";
import { Constructor } from "../../../types";
import { SyntaxKind } from "../../../typescript";
import { ModifierableNode } from "../../base";
import { callBaseFill } from "../../callBaseFill";
import { callBaseGetStructure } from "../../callBaseGetStructure";
import { Node } from "../../common";

export type AbstractableNodeExtensionType = Node & ModifierableNode;

export interface AbstractableNode {
    /**
     * Gets if the node is abstract.
     */
    isAbstract(): boolean;
    /**
     * Gets the abstract keyword or undefined if it doesn't exist.
     */
    getAbstractKeyword(): Node | undefined;
    /**
     * Gets the abstract keyword or throws if it doesn't exist.
     */
    getAbstractKeywordOrThrow(): Node;
    /**
     * Sets if the node is abstract.
     * @param isAbstract - If it should be abstract or not.
     */
    setIsAbstract(isAbstract: boolean): this;
}

export function AbstractableNode<T extends Constructor<AbstractableNodeExtensionType>>(Base: T): Constructor<AbstractableNode> & T {
    return class extends Base implements AbstractableNode {
        isAbstract() {
            return this.getAbstractKeyword() != null;
        }

        getAbstractKeyword() {
            return this.getFirstModifierByKind(SyntaxKind.AbstractKeyword);
        }

        getAbstractKeywordOrThrow() {
            return errors.throwIfNullOrUndefined(this.getAbstractKeyword(), "Expected to find an abstract keyword.");
        }

        setIsAbstract(isAbstract: boolean) {
            this.toggleModifier("abstract", isAbstract);
            return this;
        }

        fill(structure: Partial<AbstractableNodeStructure>) {
            callBaseFill(Base.prototype, this, structure);

            if (structure.isAbstract != null)
                this.setIsAbstract(structure.isAbstract);

            return this;
        }

        getStructure() {
            return callBaseGetStructure<AbstractableNodeStructure>(Base.prototype, this, {
                isAbstract: this.isAbstract()
            });
        }
    };
}
