import { InitializerExpressionableNodeStructure, JSDocableNodeStructure, PropertyNamedNodeStructure } from "../base";
import { KindedStructure, Structure } from "../Structure.generated";
import { StructureKind } from "../StructureKind";

export interface EnumMemberStructure
  extends Structure, EnumMemberSpecificStructure, PropertyNamedNodeStructure, JSDocableNodeStructure, InitializerExpressionableNodeStructure
{
}

export interface EnumMemberSpecificStructure extends KindedStructure<StructureKind.EnumMember> {
  /** Convenience property for setting the initializer. */
  value?: number | string;
}
