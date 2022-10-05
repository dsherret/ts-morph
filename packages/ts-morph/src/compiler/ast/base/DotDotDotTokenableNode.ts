import { errors, ts } from "@ts-morph/common";
import { Constructor } from "../../../types";
import { Node } from "../common";

export type DotDotDotTokenableNodeExtensionType = Node<ts.Node & { dotDotDotToken?: ts.DotDotDotToken }>;

export interface DotDotDotTokenableNode {
  /**
   * Gets the dot dot dot token (...) if it exists or returns undefined
   */
  getDotDotDotToken(): Node<ts.DotDotDotToken> | undefined;
  /**
   * Gets the dot dot dot token (...) if it exists or throws if not.
   */
  getDotDotDotTokenOrThrow(message?: string | (() => string)): Node<ts.DotDotDotToken>;
}

export function DotDotDotTokenableNode<T extends Constructor<DotDotDotTokenableNodeExtensionType>>(Base: T): Constructor<DotDotDotTokenableNode> & T {
  return class extends Base implements DotDotDotTokenableNode {
    getDotDotDotTokenOrThrow(message?: string | (() => string)) {
      return errors.throwIfNullOrUndefined(this.getDotDotDotToken(), message || "Expected to find a dot dot dot token (...).", this);
    }

    getDotDotDotToken() {
      return this._getNodeFromCompilerNodeIfExists(this.compilerNode.dotDotDotToken);
    }
  };
}
