import {NamedStructure, DocumentationableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure, BodiedNodeStructure} from "./../base";
import {StatementedNodeStructure} from "./../statement";

export interface NamespaceDeclarationStructure
    extends NamedStructure, NamespaceDeclarationSpecificStructure, DocumentationableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure, StatementedNodeStructure,
        BodiedNodeStructure
{
}

export interface NamespaceDeclarationSpecificStructure {
    /**
     * If the namespace has the module keyword.
     */
    hasModuleKeyword?: boolean;
}
