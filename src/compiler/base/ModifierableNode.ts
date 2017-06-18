import * as ts from "typescript";
import * as errors from "./../../errors";
import {insertCreatingSyntaxList, insertIntoSyntaxList, removeNodes} from "./../../manipulation";
import {Node} from "./../common";

export type ModiferableNodeExtensionType = Node;
export type ModifierTexts = "export" | "default" | "declare" | "abstract" | "public" | "protected" | "private" | "readonly" | "static" | "async" | "const";

export interface ModifierableNode {
    /**
     * Gets the node's modifiers.
     */
    getModifiers(): Node[];
    /**
     * Gets the first modifier of the specified syntax kind or undefined if none found.
     * @param kind - Syntax kind.
     */
    getFirstModifierByKind(kind: ts.SyntaxKind): Node<ts.Modifier> | undefined;
    /**
     * Gets if it has the specified modifier.
     * @param kind - Syntax kind to check for.
     */
    hasModifier(kind: ts.SyntaxKind): boolean;
    /**
     * Gets if it has the specified modifier.
     * @param text - Text to check for.
     */
    hasModifier(text: ModifierTexts): boolean;
    /**
     * Toggles a modifier.
     * @param text - Text to toggle the modifier for.
     * @param value - Optional toggling value.
     */
    toggleModifier(text: ModifierTexts, value?: boolean): this;
    /**
     * Add a modifier with the specified text.
     * @param text - Modifier text to add.
     * @returns The added modifier.
     * @internal
     */
    addModifier(text: ModifierTexts): Node<ts.Modifier>;
}

export function ModifierableNode<T extends Constructor<ModiferableNodeExtensionType>>(Base: T): Constructor<ModifierableNode> & T {
    return class extends Base implements ModifierableNode {
        getModifiers() {
            return this.node.modifiers == null ? [] : this.node.modifiers.map(m => this.factory.getNodeFromCompilerNode(m, this.sourceFile));
        }

        getFirstModifierByKind(kind: ts.SyntaxKind) {
            for (const modifier of this.getModifiers()) {
                if (modifier.getKind() === kind)
                    return modifier as Node<ts.Modifier>;
            }

            return undefined;
        }

        hasModifier(kind: ts.SyntaxKind): boolean;
        hasModifier(text: ModifierTexts): boolean;
        hasModifier(textOrKind: ModifierTexts | ts.SyntaxKind) {
            if (typeof textOrKind === "string")
                return this.getModifiers().some(m => m.getText() === textOrKind);
            else
                return this.getModifiers().some(m => m.getKind() === textOrKind);
        }

        toggleModifier(text: ModifierTexts, value?: boolean) {
            const hasModifier = this.hasModifier(text);
            if (value == null)
                value = !hasModifier;
            if (hasModifier === value)
                return this;

            if (!hasModifier)
                this.addModifier(text);
            else
                removeNodes([this.getModifiers().find(m => m.getText() === text)]);

            return this;
        }

        addModifier(text: ModifierTexts): Node<ts.Modifier> {
            const modifiers = this.getModifiers();
            const hasModifier = modifiers.some(m => m.getText() === text);
            if (hasModifier)
                return this.getModifiers().find(m => m.getText() === text) as Node<ts.Modifier>;

            // get insert position & index
            let insertPos = this.getStart();
            let insertIndex = 0;
            getAddAfterModifierTexts(text).forEach(addAfterText => {
                for (let i = 0; i < modifiers.length; i++) {
                    const modifier = modifiers[i];
                    if (modifier.getText() === addAfterText) {
                        if (insertPos < modifier.getEnd()) {
                            insertPos = modifier.getEnd();
                            insertIndex = i + 1;
                        }
                        break;
                    }
                }
            });

            // insert setup
            let startPos: number;
            let insertText: string;
            const isFirstModifier = insertPos === this.getStart();
            if (isFirstModifier) {
                insertText = text + " ";
                startPos = insertPos;
            }
            else {
                insertText = " " + text;
                startPos = insertPos + 1;
            }

            // insert
            if (modifiers.length === 0)
                insertCreatingSyntaxList(this.getSourceFile(), insertPos, insertText);
            else
                insertIntoSyntaxList(this.getSourceFile(), insertPos, insertText, modifiers[0].getParentSyntaxListOrThrow(), insertIndex, 1);

            return this.getModifiers().find(m => m.getStart() === startPos) as Node<ts.Modifier>;
        }
    };
}

/**
 * @returns The texts the specified text should appear after.
 */
function getAddAfterModifierTexts(text: ModifierTexts): ModifierTexts[] {
    switch (text) {
        case "export":
            return [];
        case "default":
            return ["export"];
        case "declare":
            return ["export", "default"];
        case "abstract":
            return ["export", "default", "declare", "public", "private", "protected"];
        case "readonly":
            return ["export", "default", "declare", "public", "private", "protected", "abstract", "static"];
        case "public":
        case "protected":
        case "private":
            return [];
        case "static":
            return ["public", "protected", "private"];
        case "async":
            return ["export", "public", "protected", "private", "static", "abstract"];
        case "const":
            return [];
        /* istanbul ignore next */
        default:
            throw new errors.NotImplementedError(`Not implemented modifier: ${text}`);
    }
}
