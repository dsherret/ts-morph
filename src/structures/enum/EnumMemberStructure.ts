import {NamedStructure, DocumentationableNodeStructure, InitializerExpressionableNodeStructure} from "./../base";

export interface EnumMemberStructure extends EnumMemberSpecificStructure, NamedStructure, DocumentationableNodeStructure, InitializerExpressionableNodeStructure {
}

export interface EnumMemberSpecificStructure {
    value?: number | string;
}
