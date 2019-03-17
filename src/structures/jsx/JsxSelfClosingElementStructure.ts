import { Structure, KindedStructure } from "../Structure";
import { StructureKind } from "../StructureKind";
import { OptionalKind } from "../types";
import { JsxAttributeStructure } from "./JsxAttributeStructure";
import { JsxSpreadAttributeStructure } from "./JsxSpreadAttributeStructure";

export interface JsxSelfClosingElementStructure extends Structure, JsxSelfClosingElementSpecificStructure {
}

export interface JsxSelfClosingElementSpecificStructure extends KindedStructure<StructureKind.JsxSelfClosingElement> {
    name: string;
    attributes?: (OptionalKind<JsxAttributeStructure> | JsxSpreadAttributeStructure)[];
}
