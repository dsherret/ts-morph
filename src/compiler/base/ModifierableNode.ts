import * as errors from "../../errors";
import { insertIntoParentTextRange, removeChildren } from "../../manipulation";
import { Constructor } from "../../types";
import { SyntaxKind, ts } from "../../typescript";
import { ArrayUtils, getSyntaxKindName } from "../../utils";
import { Node } from "../common/Node";
import { Scope } from "../common/Scope";
import { KindToNodeMappings } from "../kindToNodeMappings";
import { ModifierableNodeStructurePrinter, ModifierableNodeStructures } from "../../structurePrinters";
import { callBaseGetStructure } from "../callBaseGetStructure";

export type ModiferableNodeExtensionType = Node;
export type ModifierTexts = "export" | "default" | "declare" | "abstract" | "public" | "protected" | "private" | "readonly" | "static" | "async" | "const";

export interface ModifierableNode {
    /**
     * Gets the node's modifiers.
     */
    getModifiers(): Node[];
    /**
     * Gets the first modifier of the specified syntax kind or throws if none found.
     * @param kind - Syntax kind.
     */
    getFirstModifierByKindOrThrow<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind];
    /**
     * Gets the first modifier of the specified syntax kind or undefined if none found.
     * @param kind - Syntax kind.
     */
    getFirstModifierByKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind] | undefined;
    /**
     * Gets if it has the specified modifier.
     * @param kind - Syntax kind to check for.
     */
    hasModifier(kind: SyntaxKind): boolean;
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
    /**
     * Removes a modifier based on the specified text.
     * @param text - Modifier text to remove.
     * @returns If the modifier was removed
     * @internal
     */
    removeModifier(text: ModifierTexts): boolean;
}

export function ModifierableNode<T extends Constructor<ModiferableNodeExtensionType>>(Base: T): Constructor<ModifierableNode> & T {
    return class extends Base implements ModifierableNode {
        getModifiers() {
            return this.getCompilerModifiers().map(m => this.getNodeFromCompilerNode(m));
        }

        getFirstModifierByKindOrThrow(kind: SyntaxKind) {
            return errors.throwIfNullOrUndefined(this.getFirstModifierByKind(kind), `Expected a modifier of syntax kind: ${getSyntaxKindName(kind)}`);
        }

        getFirstModifierByKind(kind: SyntaxKind) {
            for (const modifier of this.getCompilerModifiers()) {
                if (modifier.kind === kind)
                    return this.getNodeFromCompilerNode(modifier);
            }

            return undefined;
        }

        hasModifier(kind: SyntaxKind): boolean;
        hasModifier(text: ModifierTexts): boolean;
        hasModifier(textOrKind: ModifierTexts | SyntaxKind) {
            if (typeof textOrKind === "string")
                return this.getModifiers().some(m => m.getText() === textOrKind);
            else
                return this.getCompilerModifiers().some(m => m.kind === textOrKind);
        }

        toggleModifier(text: ModifierTexts, value?: boolean) {
            if (value == null)
                value = !this.hasModifier(text);

            if (value)
                this.addModifier(text);
            else
                this.removeModifier(text);

            return this;
        }

        addModifier(text: ModifierTexts): Node<ts.Modifier> {
            const modifiers = this.getModifiers();
            const existingModifier = ArrayUtils.find(modifiers, m => m.getText() === text);
            if (existingModifier != null)
                return existingModifier;

            // get insert position & index
            const {insertPos, insertIndex} = getInsertInfo(this);

            // insert setup
            let startPos: number;
            let newText: string;
            const isFirstModifier = modifiers.length === 0 || insertPos === modifiers[0].getStart();
            if (isFirstModifier) {
                newText = text + " ";
                startPos = insertPos;
            }
            else {
                newText = " " + text;
                startPos = insertPos + 1;
            }

            // insert
            insertIntoParentTextRange({
                parent: modifiers.length === 0 ? this : modifiers[0].getParentSyntaxListOrThrow(),
                insertPos,
                newText
            });

            return ArrayUtils.find(this.getModifiers(), m => m.getStart() === startPos) as Node<ts.Modifier>;

            function getInsertInfo(node: ModifierableNode & Node) {
                let pos = getInitialInsertPos();
                let index = 0;
                for (const addAfterText of getAddAfterModifierTexts(text)) {
                    for (let i = 0; i < modifiers.length; i++) {
                        const modifier = modifiers[i];
                        if (modifier.getText() === addAfterText) {
                            if (pos < modifier.getEnd()) {
                                pos = modifier.getEnd();
                                index = i + 1;
                            }
                            break;
                        }
                    }
                }
                return { insertPos: pos, insertIndex: index };

                function getInitialInsertPos() {
                    if (modifiers.length > 0)
                        return modifiers[0].getStart();
                    for (const child of node.getChildrenIterator()) {
                        // skip over any initial syntax lists (ex. decorators) or js docs
                        if (child.getKind() === SyntaxKind.SyntaxList || ts.isJSDocCommentContainingNode(child.compilerNode))
                            continue;
                        return child.getStart();
                    }
                    return node.getStart();
                }
            }
        }

        removeModifier(text: ModifierTexts) {
            const modifiers = this.getModifiers();
            const modifier = ArrayUtils.find(modifiers, m => m.getText() === text);
            if (modifier == null)
                return false;

            removeChildren({
                children: [modifiers.length === 1 ? modifier.getParentSyntaxListOrThrow() : modifier],
                removeFollowingSpaces: true
            });

            return true;
        }

        private getCompilerModifiers() {
            return this.compilerNode.modifiers || ([] as any as ts.NodeArray<ts.Modifier>);
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
