import {ts, SyntaxKind} from "./../../typescript";
import {Constructor} from "./../../Constructor";
import * as errors from "./../../errors";
import {AmbientableNodeStructure} from "./../../structures";
import {TypeGuards} from "./../../utils";
import {callBaseFill} from "./../callBaseFill";
import {Node} from "./../common";
import {ModifierableNode} from "./ModifierableNode";

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
            const isThisAmbient = (this.getCombinedModifierFlags() & ts.ModifierFlags.Ambient) === ts.ModifierFlags.Ambient;
            if (isThisAmbient || TypeGuards.isInterfaceDeclaration(this) || TypeGuards.isTypeAliasDeclaration(this))
                return true;

            let topParent = this as Node;
            for (const parent of this.getAncestors()) {
                topParent = parent; // store the top parent for later

                const modifierFlags = parent.getCombinedModifierFlags();
                if (modifierFlags & ts.ModifierFlags.Ambient)
                    return true;
            }

            return TypeGuards.isSourceFile(topParent) && topParent.isDeclarationFile();
        }

        setHasDeclareKeyword(value: boolean) {
            // do nothing for these kind of nodes
            if (TypeGuards.isInterfaceDeclaration(this) || TypeGuards.isTypeAliasDeclaration(this))
                return this;

            this.toggleModifier("declare", value);
            return this;
        }

        fill(structure: Partial<AmbientableNodeStructure>) {
            callBaseFill(Base.prototype, this, structure);

            if (structure.hasDeclareKeyword != null)
                this.setHasDeclareKeyword(structure.hasDeclareKeyword);

            return this;
        }
    };
}
