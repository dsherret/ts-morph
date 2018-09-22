import { NamedNodeStructure } from "../base";

export interface TypeParameterDeclarationStructure extends TypeParameterDeclarationSpecificStructure, NamedNodeStructure {
}

export interface TypeParameterDeclarationSpecificStructure {
    constraint?: string;
    default?: string;
}
