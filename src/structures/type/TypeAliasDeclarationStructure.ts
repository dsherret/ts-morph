import {NamedNodeStructure, TypedNodeStructure, TypeParameteredNodeStructure, DocumentationableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure} from "./../base";

export interface TypeAliasDeclarationStructure
    extends NamedNodeStructure, TypedNodeStructure, TypeParameteredNodeStructure, DocumentationableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure
{
    type: string; // make required (from base)
}
