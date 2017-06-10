import {NamedStructure, ScopeableNodeStructure, ExtendsClauseableNodeStructure, TypeParameteredNodeStructure, DocumentationableNodeStructure,
    AmbientableNodeStructure, ExportableNodeStructure} from "./../base";
import {PropertySignatureStructure} from "./PropertySignatureStructure";
import {MethodSignatureStructure} from "./MethodSignatureStructure";

export interface InterfaceDeclarationStructure
    extends NamedStructure, InterfaceDeclarationSpecificStructure, ExtendsClauseableNodeStructure, TypeParameteredNodeStructure,
        DocumentationableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure
{
}

export interface InterfaceDeclarationSpecificStructure {
    properties?: PropertySignatureStructure[];
    methods?: MethodSignatureStructure[];
}
