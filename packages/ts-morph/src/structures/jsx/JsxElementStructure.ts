import { KindedStructure, Structure } from "../Structure";
import { StructureKind } from "../StructureKind";
import { OptionalKind } from "../types";
import { JsxAttributeStructure } from "./JsxAttributeStructure";
import { JsxSelfClosingElementStructure } from "./JsxSelfClosingElementStructure";
import { JsxSpreadAttributeStructure } from "./JsxSpreadAttributeStructure";

export interface JsxElementStructure extends Structure, JsxElementSpecificStructure {
}

export interface JsxElementSpecificStructure extends KindedStructure<StructureKind.JsxElement> {
  name: string;
  attributes?: (OptionalKind<JsxAttributeStructure> | JsxSpreadAttributeStructure)[];
  children?: (OptionalKind<JsxElementStructure> | JsxSelfClosingElementStructure)[];
  bodyText?: string;
}
