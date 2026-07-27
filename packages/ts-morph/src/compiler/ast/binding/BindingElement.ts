import { errors, ts } from "@ts-morph/common";
import { PropertyName } from "../aliases";
import { BindingNamedNode, DotDotDotTokenableNode, InitializerExpressionableNode } from "../base";
import { Node } from "../common";

const createBase = <T extends typeof Node>(ctor: T) => DotDotDotTokenableNode(InitializerExpressionableNode(BindingNamedNode(ctor)));
export const BindingElementBase = createBase(Node);
export class BindingElement extends BindingElementBase<ts.BindingElement> {
  /**
   * Gets if this is an elision — the hole in `const [, a] = x`.
   *
   * The `typescript` package parsed a hole as an `OmittedExpression`; tsgo emits
   * a zero-width binding element with no name, initializer or dot-dot-dot token,
   * so `ArrayBindingPattern#getElements()` can return one of these and asking it
   * for its name throws.
   */
  isElision(): boolean {
    return this.compilerNode.name == null;
  }

  /**
   * Gets the name node, throwing on an elision.
   *
   * The base implementation would fail with a `TypeError` instead. See
   * {@link BindingElement#isElision}.
   */
  getNameNode() {
    this.#throwIfIsElision();
    return super.getNameNode();
  }

  /**
   * Gets the name as a string, throwing on an elision.
   *
   * The base implementation would fail with a `TypeError` instead. See
   * {@link BindingElement#isElision}.
   */
  getName() {
    this.#throwIfIsElision();
    return super.getName();
  }

  #throwIfIsElision() {
    if (this.isElision())
      throw new errors.InvalidOperationError("An elision in an array binding pattern has no name.");
  }

  /**
   * Gets binding element's property name node or throws if not found.
   *
   * For example in `const { a: b } = { a: 5 }`, `a` would be the property name.
   */
  getPropertyNameNodeOrThrow(message?: string | (() => string)): PropertyName {
    return errors.throwIfNullOrUndefined(this.getPropertyNameNode(), message ?? "Expected to find a property name node.", this);
  }

  /**
   * Gets binding element's property name node or returns undefined if not found.
   *
   * For example in `const { a: b } = { a: 5 }`, `a` would be the property name.
   */
  getPropertyNameNode(): PropertyName | undefined {
    return this._getNodeFromCompilerNodeIfExists(this.compilerNode.propertyName);
  }
}
