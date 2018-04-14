import { JsxAttributeStructure } from "./JsxAttributeStructure";

export interface JsxElementStructure {
    name: string;
    attributes?: JsxAttributeStructure[];
    isSelfClosing?: boolean;
    children?: JsxElementStructure[];
}
