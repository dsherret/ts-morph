import { AmbientableNodeStructure, ExportableNodeStructure, ExtendsClauseableNodeStructure, JSDocableNodeStructure, NamedNodeStructure,
    TypeElementMemberedNodeStructure, TypeParameteredNodeStructure } from "../base";

export interface InterfaceDeclarationStructure extends NamedNodeStructure, InterfaceDeclarationSpecificStructure, ExtendsClauseableNodeStructure, TypeParameteredNodeStructure,
    JSDocableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure, TypeElementMemberedNodeStructure
{
}

export interface InterfaceDeclarationSpecificStructure {
}
