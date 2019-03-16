import { Structure } from "../Structure";

export interface JsxSpreadAttributeStructure extends Structure, JsxSpreadAttributeSpecificStructure {
}

export interface JsxSpreadAttributeSpecificStructure {
    isSpreadAttribute: true;
    expression: string;
}
