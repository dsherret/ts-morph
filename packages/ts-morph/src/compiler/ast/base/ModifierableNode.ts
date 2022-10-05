import { errors, getSyntaxKindName, SyntaxKind, ts } from "@ts-morph/common";
import { insertIntoParentTextRange, removeChildren } from "../../../manipulation";
import { Constructor } from "../../../types";
import { Node } from "../common";
import { KindToNodeMappings } from "../kindToNodeMappings";

export type ModifierableNodeExtensionType = Node;
export type ModifierTexts =
  | "export"
  | "default"
  | "declare"
  | "abstract"
  | "public"
  | "protected"
  | "private"
  | "readonly"
  | "static"
  | "async"
  | "const"
  | "override"
  | "in"
  | "out";

export interface ModifierableNode {
  /**
   * Gets the node's modifiers.
   */
  getModifiers(): Node<ts.Modifier>[];
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

export function ModifierableNode<T extends Constructor<ModifierableNodeExtensionType>>(Base: T): Constructor<ModifierableNode> & T {
  return class extends Base implements ModifierableNode {
    getModifiers() {
      return this.getCompilerModifiers().map(m => this._getNodeFromCompilerNode(m)) as Node<ts.Modifier>[];
    }

    getFirstModifierByKindOrThrow<TKind extends SyntaxKind>(kind: TKind, message?: string | (() => string)) {
      return errors.throwIfNullOrUndefined(this.getFirstModifierByKind(kind), message || `Expected a modifier of syntax kind: ${getSyntaxKindName(kind)}`, this);
    }

    getFirstModifierByKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind] | undefined {
      for (const modifier of this.getCompilerModifiers()) {
        if (modifier.kind === kind)
          return this._getNodeFromCompilerNode(modifier) as KindToNodeMappings[TKind];
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
      const rawModifiers = this.getModifiers();
      const modifiers = this.getModifiers().filter(m => m.getKind() !== SyntaxKind.Decorator);
      const existingModifier = modifiers.find(m => m.getText() === text);
      if (existingModifier != null)
        return existingModifier;

      // get insert position
      const insertPos = getInsertPos(this);

      // insert setup
      let startPos: number;
      let newText: string;
      const isFirstModifier = modifiers.length === 0 || insertPos === modifiers[0].getStart();
      if (isFirstModifier) {
        newText = text + " ";
        startPos = insertPos;
      } else {
        newText = " " + text;
        startPos = insertPos + 1;
      }

      // insert
      insertIntoParentTextRange({
        parent: rawModifiers.length === 0 ? this : rawModifiers[0].getParentSyntaxListOrThrow(),
        insertPos,
        newText,
      });

      return this.getModifiers().find(m => m.getStart() === startPos) as Node<ts.Modifier>;

      function getInsertPos(node: ModifierableNode & Node) {
        let pos = getInitialInsertPos();
        for (const addAfterText of getAddAfterModifierTexts(text)) {
          for (let i = 0; i < modifiers.length; i++) {
            const modifier = modifiers[i];
            if (modifier.getText() === addAfterText) {
              if (pos < modifier.getEnd())
                pos = modifier.getEnd();
              break;
            }
          }
        }
        return pos;

        function getInitialInsertPos() {
          if (modifiers.length > 0)
            return modifiers[0].getStart();
          for (const child of node._getChildrenIterator()) {
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
      const modifier = modifiers.find(m => m.getText() === text);
      if (modifier == null)
        return false;

      removeChildren({
        children: [modifiers.length === 1 ? modifier.getParentSyntaxListOrThrow() : modifier],
        removeFollowingSpaces: true,
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
    case "public":
    case "protected":
    case "private":
      return [];
    case "default":
      return ["export"];
    case "const":
      return ["export"];
    case "declare":
      return ["export", "default"];
    case "static":
      return ["public", "protected", "private"];
    case "override":
      return ["public", "private", "protected", "static"];
    case "abstract":
      return ["export", "default", "declare", "public", "private", "protected", "static", "override"];
    case "async":
      return ["export", "default", "declare", "public", "private", "protected", "static", "override", "abstract"];
    case "readonly":
      return ["export", "default", "declare", "public", "private", "protected", "static", "override", "abstract"];
    case "out":
      return ["in"];
    case "in":
      return [];
    /* istanbul ignore next */
    default:
      errors.throwNotImplementedForNeverValueError(text);
  }
}
