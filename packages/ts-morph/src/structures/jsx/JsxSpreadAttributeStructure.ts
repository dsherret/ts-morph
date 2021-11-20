import { KindedStructure, Structure } from "../Structure.generated";
import { StructureKind } from "../StructureKind";

export interface JsxSpreadAttributeStructure extends Structure, JsxSpreadAttributeSpecificStructure {
}

export interface JsxSpreadAttributeSpecificStructure extends KindedStructure<StructureKind.JsxSpreadAttribute> {
  expression: string;
}
