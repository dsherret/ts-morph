import { InitializerExpressionableNodeStructure, JSDocableNodeStructure, PropertyNamedNodeStructure } from "../base";
import { Structure } from "../Structure";

export interface EnumMemberStructure
    extends Structure, EnumMemberSpecificStructure, PropertyNamedNodeStructure, JSDocableNodeStructure, InitializerExpressionableNodeStructure
{
}

export interface EnumMemberSpecificStructure {
    value?: number | string;
}
