import { InitializerExpressionableNodeStructure, JSDocableNodeStructure, PropertyNamedNodeStructure } from "../base";
import { Structure } from "../Structure";

export interface EnumMemberStructure
    extends Structure, EnumMemberSpecificStructure, PropertyNamedNodeStructure, JSDocableNodeStructure, InitializerExpressionableNodeStructure
{
}

export interface EnumMemberSpecificStructure {
    /** Convenience property for setting the initializer. */
    value?: number | string;
}
