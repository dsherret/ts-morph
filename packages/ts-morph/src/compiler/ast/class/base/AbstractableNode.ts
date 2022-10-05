import { errors, SyntaxKind } from "@ts-morph/common";
import { AbstractableNodeStructure } from "../../../../structures";
import { Constructor } from "../../../../types";
import { ModifierableNode } from "../../base";
import { callBaseGetStructure } from "../../callBaseGetStructure";
import { callBaseSet } from "../../callBaseSet";
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
  getAbstractKeywordOrThrow(message?: string | (() => string)): Node;
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

    getAbstractKeywordOrThrow(message?: string | (() => string)) {
      return errors.throwIfNullOrUndefined(this.getAbstractKeyword(), message || "Expected to find an abstract keyword.", this);
    }

    setIsAbstract(isAbstract: boolean) {
      this.toggleModifier("abstract", isAbstract);
      return this;
    }

    set(structure: Partial<AbstractableNodeStructure>) {
      callBaseSet(Base.prototype, this, structure);

      if (structure.isAbstract != null)
        this.setIsAbstract(structure.isAbstract);

      return this;
    }

    getStructure() {
      return callBaseGetStructure<AbstractableNodeStructure>(Base.prototype, this, {
        isAbstract: this.isAbstract(),
      });
    }
  };
}
