import {NamedStructure, TypedNodeStructure, TypeParameteredNodeStructure, DocumentationableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure} from "./../base";

export interface TypeAliasDeclarationStructure
    extends NamedStructure, TypedNodeStructure, TypeParameteredNodeStructure, DocumentationableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure
{
    type: string; // make required (from base)
}
