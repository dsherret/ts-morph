import * as ts from "typescript";
import {Node} from "./../common";

export type ModiferableNodeExtensionType = Node<ts.Node>;

export interface ModifierableNode {
    getModifiers(): Node<ts.Node>[];
    getCombinedModifierFlags(): ts.ModifierFlags;
    getFirstModifierByKind(kind: ts.SyntaxKind): Node<ts.Node> | undefined;
    addModifier(text: string, addAfterModifierTexts: string[]): Node<ts.Node>;
}

export function ModifierableNode<T extends Constructor<ModiferableNodeExtensionType>>(Base: T): Constructor<ModifierableNode> & T {
    return class extends Base implements ModifierableNode {
        /**
         * Gets the node's modifiers.
         */
        getModifiers() {
            return this.node.modifiers == null ? [] : this.node.modifiers.map(m => this.factory.getNodeFromCompilerNode(m));
        }

        /**
         * Gets the combined modifier flags.
         */
        getCombinedModifierFlags() {
            return ts.getCombinedModifierFlags(this.node);
        }

        /**
         * Gets the first modifier of the specified syntax kind or undefined if none found.
         * @param kind - Syntax kind.
         */
        getFirstModifierByKind(kind: ts.SyntaxKind) {
            for (let modifier of this.getModifiers()) {
                if (modifier.getKind() === kind)
                    return modifier;
            }

            return undefined;
        }

        /**
         * Add a modifier with the specified text.
         * @param text - Modifier text to add.
         * @param addAfterModifierTexts - Add after these modifier texts.
         * @returns The added modifier.
         * @internal
         */
        addModifier(text: string, addAfterModifierTexts: string[]): Node<ts.Node> {
            // get insert position
            const modifiers = (this.node.modifiers || []) as ts.NodeArray<ts.Modifier>;
            let insertPos = this.node.pos;
            addAfterModifierTexts.forEach(addAfterText => {
                for (let modifier of modifiers) {
                    if (modifier.getText() === addAfterText) {
                        if (insertPos < modifier.end)
                            insertPos = modifier.end;
                        break;
                    }
                }
            });

            // insert setup
            let startPos: number;
            const isFirstModifier = insertPos === this.node.pos;
            if (isFirstModifier) {
                text = text + " ";
                startPos = insertPos;
            }
            else {
                text = " " + text;
                startPos = insertPos + 1;
            }

            // insert
            const sourceFile = this.getRequiredSourceFile();
            sourceFile.insertText(insertPos, text);

            return this.getModifiers().filter(m => m.getStart() === startPos)[0];
        }
    };
}
