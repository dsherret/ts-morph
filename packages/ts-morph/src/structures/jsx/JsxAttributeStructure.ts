import { KindedStructure, Structure } from "../Structure.generated";
import { StructureKind } from "../StructureKind";
import { JsxNamespacedNameStructure } from "./JsxNamespacedNameStructure";

export interface JsxAttributeStructure extends Structure, JsxAttributeSpecificStructure {
}

export interface JsxAttributeSpecificStructure extends KindedStructure<StructureKind.JsxAttribute> {
  name: string | JsxNamespacedNameStructure;
  initializer?: string;
}
