import {NamedStructure, DocumentationableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure} from "./../base";
import {StatementedNodeStructure} from "./../statement";

export interface NamespaceDeclarationStructure
    extends NamedStructure, NamespaceDeclarationSpecificStructure, DocumentationableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure, StatementedNodeStructure
{
}

export interface NamespaceDeclarationSpecificStructure {
    /**
     * If the namespace has the module keyword.
     */
    hasModuleKeyword?: boolean;
}
