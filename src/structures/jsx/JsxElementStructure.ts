import { JsxAttributeStructure } from "./JsxAttributeStructure";
import { JsxSpreadAttributeStructure } from "./JsxSpreadAttributeStructure";

export interface JsxElementStructure {
    name: string;
    attributes?: (JsxAttributeStructure | JsxSpreadAttributeStructure)[];
    isSelfClosing?: boolean;
    children?: JsxElementStructure[];
    bodyText?: string;
}
