import { AmbientableNodeStructure, ExportableNodeStructure, JSDocableNodeStructure, NamedNodeStructure } from "../base";
import { Structure } from "../Structure";
import { StructureKind } from "../StructureKind";
import { EnumMemberStructure } from "./EnumMemberStructure";

export interface EnumDeclarationStructure
    extends NamedNodeStructure, EnumDeclarationSpecificStructure, JSDocableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure
{
}

export interface EnumDeclarationSpecificStructure extends Structure<StructureKind.Enum> {
    isConst?: boolean;
    members?: EnumMemberStructure[];
}
