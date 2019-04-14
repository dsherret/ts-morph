import { JSDocableNodeStructure, PropertyNamedNodeStructure } from "../base";
import { Structure } from "../Structure";

export interface EnumMemberStructure extends Structure, EnumMemberSpecificStructure, PropertyNamedNodeStructure, JSDocableNodeStructure
{
}

export interface EnumMemberSpecificStructure {
    value?: number | string;
}
