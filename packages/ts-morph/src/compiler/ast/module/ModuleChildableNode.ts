import { errors, SyntaxKind } from "@ts-morph/common";
import { Constructor } from "../../../types";
import { Node } from "../common";
import { ModuleDeclaration } from "./ModuleDeclaration";

export type ModuleChildableNodeExtensionType = Node;

export interface ModuleChildableNode {
  /**
   * Gets the parent module declaration or undefined if it doesn't exist.
   */
  getParentModule(): ModuleDeclaration | undefined;

  /**
   * Gets the parent module declaration or throws if it doesn't exist.
   */
  getParentModuleOrThrow(message?: string): ModuleDeclaration;
}

export function ModuleChildableNode<T extends Constructor<ModuleChildableNodeExtensionType>>(Base: T): Constructor<ModuleChildableNode> & T {
  return class extends Base implements ModuleChildableNode {
    getParentModuleOrThrow() {
      return errors.throwIfNullOrUndefined(this.getParentModule(), "Expected to find the parent module declaration.");
    }

    getParentModule() {
      let parent = this.getParentOrThrow();
      if (!Node.isModuleBlock(parent))
        return undefined;

      while (parent.getParentOrThrow().getKind() === SyntaxKind.ModuleDeclaration)
        parent = parent.getParentOrThrow();

      return parent as ModuleDeclaration;
    }
  };
}
