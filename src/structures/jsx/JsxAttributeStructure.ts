import { NamedNodeStructure } from "../base";

export interface JsxAttributeStructure extends JsxAttributeStructureSpecific, NamedNodeStructure {
}

export interface JsxAttributeStructureSpecific {
    isSpreadAttribute?: false;
    initializer?: string;
}
