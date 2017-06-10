import {NamedStructure} from "./../base";

export interface NamespaceDeclarationStructure extends NamedStructure, NamespaceDeclarationSpecificStructure {
}

export interface NamespaceDeclarationSpecificStructure {
    /**
     * If the namespace has the module keyword.
     */
    hasModuleKeyword?: boolean;
}
