import { WriterFunction } from "../../types";
import { NamedNodeStructure } from "../base";
import { Structure } from "../Structure";

export interface TypeParameterDeclarationStructure extends Structure, TypeParameterDeclarationSpecificStructure, NamedNodeStructure {
}

export interface TypeParameterDeclarationSpecificStructure {
    constraint?: string | WriterFunction;
    default?: string | WriterFunction;
}
