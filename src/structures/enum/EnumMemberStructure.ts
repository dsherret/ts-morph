import {PropertyNamedNodeStructure, DocumentationableNodeStructure, InitializerExpressionableNodeStructure} from "./../base";

export interface EnumMemberStructure extends EnumMemberSpecificStructure, PropertyNamedNodeStructure, DocumentationableNodeStructure, InitializerExpressionableNodeStructure {
}

export interface EnumMemberSpecificStructure {
    value?: number | string;
}
