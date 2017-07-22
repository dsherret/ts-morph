import * as ts from "typescript";
import {Constructor} from "./../../Constructor";
import {AmbientableNodeStructure} from "./../../structures";
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
     * Gets if the node is ambient.
     */
    isAmbient(): boolean;
    /**
     * Toggles or sets if this node has a declare keyword.
     * @param value - If to add the declare keyword or not.
     */
    toggleDeclareKeyword(value?: boolean): this;
}

export function AmbientableNode<T extends Constructor<AmbientableNodeExtensionType>>(Base: T): Constructor<AmbientableNode> & T {
    return class extends Base implements AmbientableNode {
        hasDeclareKeyword() {
            return this.getDeclareKeyword() != null;
        }

        getDeclareKeyword() {
            return this.getFirstModifierByKind(ts.SyntaxKind.DeclareKeyword);
        }

        isAmbient() {
            const isThisAmbient = (this.getCombinedModifierFlags() & ts.ModifierFlags.Ambient) === ts.ModifierFlags.Ambient;
            if (isThisAmbient || this.isInterfaceDeclaration() || this.isTypeAliasDeclaration())
                return true;

            let topParent = this as Node;
            for (const parent of this.getParents()) {
                topParent = parent; // store the top parent for later

                const modifierFlags = parent.getCombinedModifierFlags();
                if (modifierFlags & ts.ModifierFlags.Ambient)
                    return true;
            }

            return topParent.isSourceFile() && topParent.isDeclarationFile();
        }

        toggleDeclareKeyword(value?: boolean) {
            this.toggleModifier("declare", value);
            return this;
        }

        fill(structure: Partial<AmbientableNodeStructure>) {
            callBaseFill(Base.prototype, this, structure);

            if (structure.hasDeclareKeyword != null)
                this.toggleDeclareKeyword(structure.hasDeclareKeyword);

            return this;
        }
    };
}
