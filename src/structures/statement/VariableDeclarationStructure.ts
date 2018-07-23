import { BindingNamedNodeStructure, ExclamationTokenableNodeStructure, InitializerExpressionableNodeStructure, TypedNodeStructure } from "../base";

export interface VariableDeclarationStructure extends VariableDeclarationSpecificStructure, BindingNamedNodeStructure,
InitializerExpressionableNodeStructure, TypedNodeStructure, ExclamationTokenableNodeStructure {
}

export interface VariableDeclarationSpecificStructure {
}
