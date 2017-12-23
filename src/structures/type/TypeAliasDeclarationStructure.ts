import {NamedNodeStructure, TypedNodeStructure, TypeParameteredNodeStructure, JSDocableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure} from "./../base";

export interface TypeAliasDeclarationStructure
    extends NamedNodeStructure, TypedNodeStructure, TypeParameteredNodeStructure, JSDocableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure
{
    type: string; // make required (from base)
}
