import { TypeParameterVariance } from "../../compiler";
import { WriterFunction } from "../../types";
import { NamedNodeStructure } from "../base";
import { KindedStructure, Structure } from "../Structure.generated";
import { StructureKind } from "../StructureKind";

export interface TypeParameterDeclarationStructure extends Structure, TypeParameterDeclarationSpecificStructure, NamedNodeStructure {
}

export interface TypeParameterDeclarationSpecificStructure extends KindedStructure<StructureKind.TypeParameter> {
  constraint?: string | WriterFunction;
  default?: string | WriterFunction;
  variance?: TypeParameterVariance;
}
