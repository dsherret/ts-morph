import { ts } from "@ts-morph/common";
import { PropertySignatureSpecificStructure, PropertySignatureStructure, StructureKind } from "../../../structures";
import {
  ChildOrderableNode,
  InitializerExpressionableNode,
  JSDocableNode,
  ModifierableNode,
  PropertyNamedNode,
  QuestionTokenableNode,
  ReadonlyableNode,
  TypedNode,
} from "../base";
import { callBaseGetStructure } from "../callBaseGetStructure";
import { callBaseSet } from "../callBaseSet";
import { TypeElement } from "./TypeElement";

const createBase = <T extends typeof TypeElement>(ctor: T) =>
  ChildOrderableNode(JSDocableNode(ReadonlyableNode(
    QuestionTokenableNode(InitializerExpressionableNode(TypedNode(PropertyNamedNode(ModifierableNode(ctor))))),
  )));
export const PropertySignatureBase = createBase(TypeElement);
export class PropertySignature extends PropertySignatureBase<ts.PropertySignature> {
  /**
   * Sets the node from a structure.
   * @param structure - Structure to set the node with.
   */
  set(structure: Partial<PropertySignatureStructure>) {
    callBaseSet(PropertySignatureBase.prototype, this, structure);

    return this;
  }

  /**
   * Gets the structure equivalent to this node.
   */
  getStructure(): PropertySignatureStructure {
    return callBaseGetStructure<PropertySignatureSpecificStructure>(PropertySignatureBase.prototype, this, {
      kind: StructureKind.PropertySignature,
    });
  }
}
