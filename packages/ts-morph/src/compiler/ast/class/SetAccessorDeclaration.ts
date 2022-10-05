import { errors, SyntaxKind, ts } from "@ts-morph/common";
import { SetAccessorDeclarationSpecificStructure, SetAccessorDeclarationStructure, StructureKind } from "../../../structures";
import { BodyableNode, ChildOrderableNode, DecoratableNode, PropertyNamedNode, ScopedNode, StaticableNode, TextInsertableNode } from "../base";
import { callBaseGetStructure } from "../callBaseGetStructure";
import { callBaseSet } from "../callBaseSet";
import { Node } from "../common";
import { FunctionLikeDeclaration } from "../function";
import { AbstractableNode } from "./base";
import { ClassElement } from "./ClassElement";
import { GetAccessorDeclaration } from "./GetAccessorDeclaration";

const createBase = <T extends typeof ClassElement>(ctor: T) =>
  ChildOrderableNode(TextInsertableNode(
    DecoratableNode(AbstractableNode(ScopedNode(StaticableNode(FunctionLikeDeclaration(BodyableNode(PropertyNamedNode(ctor))))))),
  ));
export const SetAccessorDeclarationBase = createBase(ClassElement);
export class SetAccessorDeclaration extends SetAccessorDeclarationBase<ts.SetAccessorDeclaration> {
  /**
   * Sets the node from a structure.
   * @param structure - Structure to set the node with.
   */
  set(structure: Partial<SetAccessorDeclarationStructure>) {
    callBaseSet(SetAccessorDeclarationBase.prototype, this, structure);
    return this;
  }

  /**
   * Gets the corresponding get accessor if one exists.
   */
  getGetAccessor(): GetAccessorDeclaration | undefined {
    const thisName = this.getName();
    const isStatic = this.isStatic();

    return this.getParentOrThrow().forEachChild(sibling => {
      if (Node.isGetAccessorDeclaration(sibling) && sibling.getName() === thisName && sibling.isStatic() === isStatic)
        return sibling;
      return undefined;
    });
  }

  /**
   * Gets the corresponding get accessor or throws if not exists.
   */
  getGetAccessorOrThrow(message?: string | (() => string)): GetAccessorDeclaration {
    return errors.throwIfNullOrUndefined(this.getGetAccessor(), () => message || `Expected to find a corresponding get accessor for ${this.getName()}.`, this);
  }

  /**
   * Gets the structure equivalent to this node.
   */
  getStructure(): SetAccessorDeclarationStructure {
    return callBaseGetStructure<SetAccessorDeclarationSpecificStructure>(SetAccessorDeclarationBase.prototype, this, {
      kind: StructureKind.SetAccessor,
    }) as any as SetAccessorDeclarationStructure;
  }
}
