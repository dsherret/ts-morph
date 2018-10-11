import { WriterFunction } from "../../types";
import { NamedNodeStructure } from "../base";

export interface TypeParameterDeclarationStructure extends TypeParameterDeclarationSpecificStructure, NamedNodeStructure {
}

export interface TypeParameterDeclarationSpecificStructure {
    constraint?: string | WriterFunction;
    default?: string | WriterFunction;
}
