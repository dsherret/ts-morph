import { ParameterDeclarationStructure } from "../function";
import { OptionalKind } from "../types";

export interface ParameteredNodeStructure {
    parameters?: OptionalKind<ParameterDeclarationStructure>[];
}
