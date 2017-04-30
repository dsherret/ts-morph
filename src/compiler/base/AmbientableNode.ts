import * as ts from "typescript";
import {Node} from "./../common";
import {SourceFile} from "./../file";
import {ModifierableNode} from "./ModifierableNode";

export type AmbientableNodeExtensionType = Node & ModifierableNode;

export interface AmbientableNode {
    hasDeclareKeyword(): boolean;
    getDeclareKeyword(): Node | undefined;
    isAmbient(): boolean;
    toggleDeclareKeyword(value?: boolean, sourceFile?: SourceFile): this;
}

export function AmbientableNode<T extends Constructor<AmbientableNodeExtensionType>>(Base: T): Constructor<AmbientableNode> & T {
    return class extends Base implements AmbientableNode {
        /**
         * If the node has the declare keyword.
         */
        hasDeclareKeyword() {
            return this.getDeclareKeyword() != null;
        }

        /**
         * Gets the declare keyword or undefined if none exists.
         */
        getDeclareKeyword() {
            return this.getFirstModifierByKind(ts.SyntaxKind.DeclareKeyword);
        }

        /**
         * Gets if the node is ambient.
         */
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

        /**
         * Sets if this node has a declare keyword.
         * @param value - If to add the declare keyword or not.
         * @param sourceFile - Optional source file to help improve performance.
         */
        toggleDeclareKeyword(value?: boolean, sourceFile: SourceFile = this.getRequiredSourceFile()) {
            this.toggleModifier("declare", value, sourceFile);
            return this;
        }
    };
}
