import { AmbientableNodeStructure, ExportableNodeStructure, JSDocableNodeStructure, NamedNodeStructure } from "../base";
import { KindedStructure, Structure } from "../Structure";
import { StructureKind } from "../StructureKind";
import { OptionalKind } from "../types";
import { EnumMemberStructure } from "./EnumMemberStructure";

export interface EnumDeclarationStructure
  extends Structure, NamedNodeStructure, EnumDeclarationSpecificStructure, JSDocableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure
{
}

export interface EnumDeclarationSpecificStructure extends KindedStructure<StructureKind.Enum> {
  isConst?: boolean;
  members?: OptionalKind<EnumMemberStructure>[];
}
