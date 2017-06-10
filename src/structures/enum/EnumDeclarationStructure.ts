import {NamedStructure, DocumentationableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure} from "./../base";
import {EnumMemberStructure} from "./EnumMemberStructure";

export interface EnumDeclarationStructure
    extends NamedStructure, EnumDeclarationSpecificStructure, DocumentationableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure
{
}

export interface EnumDeclarationSpecificStructure {
    isConst?: boolean;
    members?: EnumMemberStructure[];
}
