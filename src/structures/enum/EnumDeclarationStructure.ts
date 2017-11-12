import {NamedNodeStructure, DocumentationableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure} from "./../base";
import {EnumMemberStructure} from "./EnumMemberStructure";

export interface EnumDeclarationStructure
    extends NamedNodeStructure, EnumDeclarationSpecificStructure, DocumentationableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure
{
}

export interface EnumDeclarationSpecificStructure {
    isConst?: boolean;
    members?: EnumMemberStructure[];
}
