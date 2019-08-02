import { ParameteredNodeStructure } from "./ParameteredNodeStructure";
import { ReturnTypedNodeStructure } from "./ReturnTypedNodeStructure";

export interface SignaturedDeclarationStructure extends ParameteredNodeStructure, ReturnTypedNodeStructure {
}
