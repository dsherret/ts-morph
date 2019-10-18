import { Structure, KindedStructure } from "../Structure";
import { StructureKind } from "../StructureKind";
import { JsxTagNamedNodeStructure, JsxAttributedNodeStructure } from "./base";

export interface JsxSelfClosingElementStructure
    extends Structure, JsxTagNamedNodeStructure, JsxSelfClosingElementSpecificStructure, JsxAttributedNodeStructure
{
}

export interface JsxSelfClosingElementSpecificStructure extends KindedStructure<StructureKind.JsxSelfClosingElement> {
}
