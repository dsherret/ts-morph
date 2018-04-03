import {NamedNodeStructure} from "../base";
import {JsxAttributeStructure} from "./JsxAttributeStructure";

export interface JsxElementStructure extends NamedNodeStructure {
    attributes?: JsxAttributeStructure[];
    isSelfClosing?: boolean;
    children?: JsxElementStructure[];
}
