import {NamedNodeStructure, ScopeableNodeStructure, ExtendsClauseableNodeStructure, TypeParameteredNodeStructure, JSDocableNodeStructure,
    AmbientableNodeStructure, ExportableNodeStructure, TypeElementMemberedNodeStructure} from "./../base";

export interface InterfaceDeclarationStructure extends NamedNodeStructure, InterfaceDeclarationSpecificStructure, ExtendsClauseableNodeStructure, TypeParameteredNodeStructure,
    JSDocableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure, TypeElementMemberedNodeStructure
{
}

export interface InterfaceDeclarationSpecificStructure {
}
