import { errors, ts } from "@ts-morph/common";
import { PropertyName } from "../aliases";
import { BindingNamedNode, DotDotDotTokenableNode, InitializerExpressionableNode } from "../base";
import { Node } from "../common";

const createBase = <T extends typeof Node>(ctor: T) => DotDotDotTokenableNode(InitializerExpressionableNode(BindingNamedNode(ctor)));
export const BindingElementBase = createBase(Node);
export class BindingElement extends BindingElementBase<ts.BindingElement> {
  /**
   * Gets binding element's property name node or throws if not found.
   *
   * For example in `const { a: b } = { a: 5 }`, `a` would be the property name.
   */
  getPropertyNameNodeOrThrow(message?: string | (() => string)): PropertyName {
    return errors.throwIfNullOrUndefined(this.getPropertyNameNode(), message || "Expected to find a property name node.");
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
