import { Structure } from "../Structure";
import { JsxAttributeStructure } from "./JsxAttributeStructure";
import { JsxSpreadAttributeStructure } from "./JsxSpreadAttributeStructure";

export interface JsxElementStructure extends Structure, JsxElementSpecificStructure {
}

export interface JsxElementSpecificStructure {
    name: string;
    attributes?: (JsxAttributeStructure | JsxSpreadAttributeStructure)[];
    isSelfClosing?: boolean;
    children?: JsxElementStructure[];
    bodyText?: string;
}