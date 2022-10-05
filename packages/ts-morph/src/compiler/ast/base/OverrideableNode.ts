import { errors, SyntaxKind, ts } from "@ts-morph/common";
import { OverrideableNodeStructure } from "../../../structures";
import { Constructor } from "../../../types";
import { callBaseGetStructure } from "../callBaseGetStructure";
import { callBaseSet } from "../callBaseSet";
import { Node } from "../common";
import { ModifierableNode } from "./ModifierableNode";

export type OverrideableNodeExtensionType = Node & ModifierableNode;

export interface OverrideableNode {
  /**
   * If it has an override keyword.
   */
  hasOverrideKeyword(): boolean;
  /**
   * Gets the override keyword or undefined if none exists.
   */
  getOverrideKeyword(): Node<ts.OverrideKeyword> | undefined;
  /**
   * Gets the override keyword or throws if none exists.
   */
  getOverrideKeywordOrThrow(message?: string | (() => string)): Node<ts.Modifier>;
  /**
   * Sets if the node has an override keyword.
   * @param value - If it should have an override keyword or not.
   */
  setHasOverrideKeyword(value: boolean): this;
}

export function OverrideableNode<T extends Constructor<OverrideableNodeExtensionType>>(Base: T): Constructor<OverrideableNode> & T {
  return class extends Base implements OverrideableNode {
    hasOverrideKeyword() {
      return this.hasModifier(SyntaxKind.OverrideKeyword);
    }

    getOverrideKeyword(): Node<ts.OverrideKeyword> | undefined {
      return this.getFirstModifierByKind(SyntaxKind.OverrideKeyword) as Node<ts.OverrideKeyword> | undefined;
    }

    getOverrideKeywordOrThrow(message?: string | (() => string)): Node<ts.OverrideKeyword> {
      return errors.throwIfNullOrUndefined(this.getOverrideKeyword(), "Expected to find an override keyword.");
    }

    setHasOverrideKeyword(value: boolean) {
      this.toggleModifier("override", value);
      return this;
    }

    set(structure: Partial<OverrideableNodeStructure>) {
      callBaseSet(Base.prototype, this, structure);

      if (structure.hasOverrideKeyword != null)
        this.setHasOverrideKeyword(structure.hasOverrideKeyword);

      return this;
    }

    getStructure() {
      return callBaseGetStructure<OverrideableNodeStructure>(Base.prototype, this, {
        hasOverrideKeyword: this.hasOverrideKeyword(),
      });
    }
  };
}
