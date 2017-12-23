import {NamedNodeStructure, ScopeableNodeStructure, ExtendsClauseableNodeStructure, TypeParameteredNodeStructure, JSDocableNodeStructure,
    AmbientableNodeStructure, ExportableNodeStructure} from "./../base";
import {PropertySignatureStructure} from "./PropertySignatureStructure";
import {MethodSignatureStructure} from "./MethodSignatureStructure";
import {ConstructSignatureDeclarationStructure} from "./ConstructSignatureDeclarationStructure";

export interface InterfaceDeclarationStructure
    extends NamedNodeStructure, InterfaceDeclarationSpecificStructure, ExtendsClauseableNodeStructure, TypeParameteredNodeStructure,
        JSDocableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure
{
}

export interface InterfaceDeclarationSpecificStructure {
    constructSignatures?: ConstructSignatureDeclarationStructure[];
    properties?: PropertySignatureStructure[];
    methods?: MethodSignatureStructure[];
}
