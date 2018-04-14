import { NamedNodeStructure } from "../base";

export interface JsxAttributeStructure extends NamedNodeStructure {
    isSpreadAttribute?: boolean;
    initializer?: string;
}
