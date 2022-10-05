import { errors, ts } from "@ts-morph/common";
import { TypeNode } from "./TypeNode";
import { TypeParameterDeclaration } from "./TypeParameterDeclaration";

export class MappedTypeNode extends TypeNode<ts.MappedTypeNode> {
  /**
   * Gets the mapped type node's name type node if any.
   */
  getNameTypeNode(): TypeNode | undefined {
    return this._getNodeFromCompilerNodeIfExists(this.compilerNode.nameType);
  }

  /** Gets the mapped type node's name type node or throws if it doesn't exist. */
  getNameTypeNodeOrThrow(message?: string | (() => string)): TypeNode {
    return errors.throwIfNullOrUndefined(this.getNameTypeNode(), "Type did not exist.");
  }

  /** Gets the mapped type's readonly token. */
  getReadonlyToken() {
    return this._getNodeFromCompilerNodeIfExists(this.compilerNode.readonlyToken);
  }

  /** Gets the mapped type's readonly token or throws if not exist. */
  getReadonlyTokenOrThrow(message?: string | (() => string)) {
    return errors.throwIfNullOrUndefined(this.getReadonlyToken(), message || "Readonly token did not exist.", this);
  }

  /** Gets the mapped type's question token. */
  getQuestionToken() {
    return this._getNodeFromCompilerNodeIfExists(this.compilerNode.questionToken);
  }

  /** Gets the mapped type's question token or throws if not exist. */
  getQuestionTokenOrThrow(message?: string | (() => string)) {
    return errors.throwIfNullOrUndefined(this.getQuestionToken(), message || "Question token did not exist.", this);
  }

  /**
   * Gets the mapped type node's type parameter.
   */
  getTypeParameter(): TypeParameterDeclaration {
    return this._getNodeFromCompilerNode(this.compilerNode.typeParameter);
  }

  /** Gets the mapped type node's type node if it exists or returns undefined when not. */
  getTypeNode(): TypeNode | undefined {
    return this._getNodeFromCompilerNodeIfExists(this.compilerNode.type);
  }

  /** Gets the mapped type node's type node if it exists or throws when undefined. */
  getTypeNodeOrThrow(message?: string | (() => string)): TypeNode {
    return errors.throwIfNullOrUndefined(this.getTypeNode(), "Type did not exist, but was expected to exist.");
  }
}
