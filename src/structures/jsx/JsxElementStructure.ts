import { Structure, KindedStructure } from "../Structure";
import { StructureKind } from "../StructureKind";
import { OptionalKind } from "../types";
import { JsxAttributeStructure } from "./JsxAttributeStructure";
import { JsxSpreadAttributeStructure } from "./JsxSpreadAttributeStructure";
import { JsxSelfClosingElementStructure } from "./JsxSelfClosingElementStructure";

export interface JsxElementStructure extends Structure, JsxElementSpecificStructure {
}

export interface JsxElementSpecificStructure extends KindedStructure<StructureKind.JsxElement> {
    name: string;
    attributes?: (OptionalKind<JsxAttributeStructure> | JsxSpreadAttributeStructure)[];
    children?: (OptionalKind<JsxElementStructure> | JsxSelfClosingElementStructure)[];
    bodyText?: string;
}
