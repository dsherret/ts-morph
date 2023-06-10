import { errors, getSyntaxKindName, SyntaxKind, ts } from "@ts-morph/common";
import { Constructor } from "../../../../types";
import { Node } from "../../common";
import { Expression } from "../../expression";
import { KindToExpressionMappings } from "../../kindToNodeMappings.generated";

export type InitializerExpressionGetableNodeExtensionType = Node<ts.Node & { initializer?: ts.Expression }>;

export interface InitializerExpressionGetableNode {
  /**
   * Gets if node has an initializer.
   */
  hasInitializer(): boolean;
  /**
   * Gets the initializer.
   */
  getInitializer(): Expression | undefined;
  /**
   * Gets the initializer if it's a certain kind or throws.
   */
  getInitializerIfKindOrThrow<TKind extends SyntaxKind>(kind: TKind): KindToExpressionMappings[TKind];
  /**
   * Gets the initializer if it's a certain kind.
   */
  getInitializerIfKind<TKind extends SyntaxKind>(kind: TKind): KindToExpressionMappings[TKind] | undefined;
  /**
   * Gets the initializer or throw.
   */
  getInitializerOrThrow(message?: string | (() => string)): Expression;
}

export function InitializerExpressionGetableNode<T extends Constructor<InitializerExpressionGetableNodeExtensionType>>(
  Base: T,
): Constructor<InitializerExpressionGetableNode> & T {
  return class extends Base implements InitializerExpressionGetableNode {
    hasInitializer() {
      return this.compilerNode.initializer != null;
    }

    getInitializerIfKindOrThrow<TKind extends SyntaxKind>(kind: TKind, message?: string | (() => string)) {
      return errors.throwIfNullOrUndefined(
        this.getInitializerIfKind(kind),
        message ?? `Expected to find an initializer of kind '${getSyntaxKindName(kind)}'.`,
        this,
      );
    }

    getInitializerIfKind<TKind extends SyntaxKind>(kind: TKind): KindToExpressionMappings[TKind] | undefined {
      const initializer = this.getInitializer();
      if (initializer != null && initializer.getKind() !== kind)
        return undefined;
      return initializer as KindToExpressionMappings[TKind];
    }

    getInitializerOrThrow(message?: string | (() => string)) {
      return errors.throwIfNullOrUndefined(this.getInitializer(), message ?? "Expected to find an initializer.", this);
    }

    getInitializer() {
      return this._getNodeFromCompilerNodeIfExists(this.compilerNode.initializer);
    }
  };
}
