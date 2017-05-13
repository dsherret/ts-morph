import * as ts from "typescript";
import * as errors from "./../../errors";
import {Node} from "./../common";
import {SourceFile} from "./../file/SourceFile";

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
     * @param sourceFile - Optional source file to help improve performance.
     */
    hasModifier(kind: ts.SyntaxKind): boolean;
    /**
     * Gets if it has the specified modifier.
     * @param text - Text to check for.
     * @param sourceFile - Optional source file to help improve performance.
     */
    hasModifier(text: ModifierTexts, sourceFile?: SourceFile): boolean;
    /**
     * Toggles a modifier.
     * @param text - Text to toggle the modifier for.
     * @param value - Optional toggling value.
     * @param sourceFile - Optional source file to help improve performance.
     */
    toggleModifier(text: ModifierTexts, value?: boolean, sourceFile?: SourceFile): this;
    /**
     * Add a modifier with the specified text.
     * @param text - Modifier text to add.
     * @param sourceFile - Optional source file to help improve performance.
     * @returns The added modifier.
     * @internal
     */
    addModifier(text: ModifierTexts, sourceFile?: SourceFile): Node<ts.Modifier>;
}

export function ModifierableNode<T extends Constructor<ModiferableNodeExtensionType>>(Base: T): Constructor<ModifierableNode> & T {
    return class extends Base implements ModifierableNode {
        getModifiers() {
            return this.node.modifiers == null ? [] : this.node.modifiers.map(m => this.factory.getNodeFromCompilerNode(m));
        }

        getFirstModifierByKind(kind: ts.SyntaxKind) {
            for (const modifier of this.getModifiers()) {
                if (modifier.getKind() === kind)
                    return modifier as Node<ts.Modifier>;
            }

            return undefined;
        }

        hasModifier(kind: ts.SyntaxKind): boolean;
        hasModifier(text: ModifierTexts, sourceFile?: SourceFile): boolean;
        hasModifier(textOrKind: ModifierTexts | ts.SyntaxKind, sourceFile?: SourceFile) {
            if (typeof textOrKind === "string") {
                sourceFile = sourceFile || this.getRequiredSourceFile();
                return this.getModifiers().some(m => m.getText(sourceFile) === textOrKind);
            }
            else
                return this.getModifiers().some(m => m.getKind() === textOrKind);
        }

        toggleModifier(text: ModifierTexts, value?: boolean, sourceFile: SourceFile = this.getRequiredSourceFile()) {
            const hasModifier = this.hasModifier(text);
            if (value == null)
                value = !hasModifier;
            if (hasModifier === value)
                return this;

            if (!hasModifier)
                this.addModifier(text, sourceFile);
            else
                sourceFile.removeNodes(this.getModifiers().find(m => m.getText() === text));

            return this;
        }

        addModifier(text: ModifierTexts, sourceFile: SourceFile = this.getRequiredSourceFile()): Node<ts.Modifier> {
            const modifiers = this.getModifiers();
            const hasModifier = modifiers.some(m => m.getText(sourceFile) === text);
            if (hasModifier)
                return this.getModifiers().find(m => m.getText(sourceFile) === text) as Node<ts.Modifier>;

            // get insert position
            let insertPos = this.getStart();
            getAddAfterModifierTexts(text).forEach(addAfterText => {
                for (const modifier of modifiers) {
                    if (modifier.getText(sourceFile) === addAfterText) {
                        if (insertPos < modifier.getEnd())
                            insertPos = modifier.getEnd();
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
            sourceFile.insertText(insertPos, insertText);

            return this.getModifiers().find(m => m.getStart(sourceFile) === startPos) as Node<ts.Modifier>;
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
