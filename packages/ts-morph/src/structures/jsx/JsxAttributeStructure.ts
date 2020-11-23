import { NamedNodeStructure } from "../base";
import { KindedStructure, Structure } from "../Structure";
import { StructureKind } from "../StructureKind";

export interface JsxAttributeStructure extends Structure, JsxAttributeSpecificStructure, NamedNodeStructure {
}

export interface JsxAttributeSpecificStructure extends KindedStructure<StructureKind.JsxAttribute> {
    initializer?: string;
}
