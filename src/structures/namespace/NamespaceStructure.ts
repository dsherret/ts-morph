import {NamedStructure} from "./../base";

export interface NamespaceStructure extends NamedStructure, NamespaceSpecificStructure {
}

export interface NamespaceSpecificStructure {
    /**
     * If the namespace has the module keyword.
     */
    hasModuleKeyword?: boolean;
}
