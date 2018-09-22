import { NamedNodeStructure } from "../base";

export interface JsxAttributeStructure extends JsxAttributeSpecificStructure, NamedNodeStructure {
}

export interface JsxAttributeSpecificStructure {
    isSpreadAttribute?: false;
    initializer?: string;
}
