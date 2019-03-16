import { AmbientableNodeStructure, ExportableNodeStructure, JSDocableNodeStructure, NamedNodeStructure } from "../base";
import { Structure } from "../Structure";
import { StructureKind } from "../StructureKind";
import { EnumMemberStructure } from "./EnumMemberStructure";

export interface EnumDeclarationStructure
    extends Structure<StructureKind.Enum>, NamedNodeStructure, EnumDeclarationSpecificStructure, JSDocableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure
{
}

export interface EnumDeclarationSpecificStructure {
    isConst?: boolean;
    members?: EnumMemberStructure[];
}
