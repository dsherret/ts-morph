import {PropertyNamedNodeStructure, JSDocableNodeStructure, InitializerExpressionableNodeStructure} from "../base";

export interface EnumMemberStructure extends EnumMemberSpecificStructure, PropertyNamedNodeStructure, JSDocableNodeStructure, InitializerExpressionableNodeStructure {
}

export interface EnumMemberSpecificStructure {
    value?: number | string;
}
