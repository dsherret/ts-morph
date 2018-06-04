import { AmbientableNodeStructure, BodiedNodeStructure, ExportableNodeStructure, JSDocableNodeStructure, NamedNodeStructure } from "../base";
import { StatementedNodeStructure } from "../statement";

export interface NamespaceDeclarationStructure
    extends NamedNodeStructure, NamespaceDeclarationSpecificStructure, JSDocableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure, StatementedNodeStructure,
        BodiedNodeStructure
{
}

export interface NamespaceDeclarationSpecificStructure {
    /**
     * If the namespace has the module keyword.
     */
    hasModuleKeyword?: boolean;
}
