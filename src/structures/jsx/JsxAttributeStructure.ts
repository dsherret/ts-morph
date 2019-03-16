import { NamedNodeStructure } from "../base";
import { Structure } from "../Structure";

export interface JsxAttributeStructure extends Structure, JsxAttributeSpecificStructure, NamedNodeStructure {
}

export interface JsxAttributeSpecificStructure {
    isSpreadAttribute?: false;
    initializer?: string;
}
