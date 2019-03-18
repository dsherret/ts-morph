import { OptionalKind } from "../../types";
import { JsxAttributeStructure } from "../JsxAttributeStructure";
import { JsxSpreadAttributeStructure } from "../JsxSpreadAttributeStructure";

export interface JsxAttributedNodeStructure {
    attributes?: (OptionalKind<JsxAttributeStructure> | JsxSpreadAttributeStructure)[];
}
