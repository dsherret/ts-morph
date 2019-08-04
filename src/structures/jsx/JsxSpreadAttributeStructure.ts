import { Structure, KindedStructure } from "../Structure";
import { StructureKind } from "../StructureKind";

export interface JsxSpreadAttributeStructure extends Structure, JsxSpreadAttributeSpecificStructure {
}

export interface JsxSpreadAttributeSpecificStructure extends KindedStructure<StructureKind.JsxSpreadAttribute> {
    expression: string;
}
