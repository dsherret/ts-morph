import {NamedNodeStructure, ScopeableNodeStructure, ExtendsClauseableNodeStructure, TypeParameteredNodeStructure, JSDocableNodeStructure,
    AmbientableNodeStructure, ExportableNodeStructure} from "./../base";
import {PropertySignatureStructure} from "./PropertySignatureStructure";
import {MethodSignatureStructure} from "./MethodSignatureStructure";
import {ConstructSignatureDeclarationStructure} from "./ConstructSignatureDeclarationStructure";
import {CallSignatureDeclarationStructure} from "./CallSignatureDeclarationStructure";
import {IndexSignatureDeclarationStructure} from "./IndexSignatureDeclarationStructure";

export interface InterfaceDeclarationStructure
    extends NamedNodeStructure, InterfaceDeclarationSpecificStructure, ExtendsClauseableNodeStructure, TypeParameteredNodeStructure,
        JSDocableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure
{
}

export interface InterfaceDeclarationSpecificStructure {
    callSignatures?: CallSignatureDeclarationStructure[];
    constructSignatures?: ConstructSignatureDeclarationStructure[];
    indexSignatures?: IndexSignatureDeclarationStructure[];
    methods?: MethodSignatureStructure[];
    properties?: PropertySignatureStructure[];
}
