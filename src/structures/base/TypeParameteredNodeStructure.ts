import { TypeParameterDeclarationStructure } from "../type";
import { OptionalKind } from "../types";

export interface TypeParameteredNodeStructure {
    typeParameters?: (OptionalKind<TypeParameterDeclarationStructure> | string)[];
}
