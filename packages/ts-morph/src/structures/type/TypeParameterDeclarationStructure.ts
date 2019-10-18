import { WriterFunction } from "../../types";
import { NamedNodeStructure } from "../base";
import { Structure, KindedStructure } from "../Structure";
import { StructureKind } from "../StructureKind";

export interface TypeParameterDeclarationStructure extends Structure, TypeParameterDeclarationSpecificStructure, NamedNodeStructure {
}

export interface TypeParameterDeclarationSpecificStructure extends KindedStructure<StructureKind.TypeParameter> {
    constraint?: string | WriterFunction;
    default?: string | WriterFunction;
}
