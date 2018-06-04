import { BindingNamedNodeStructure, ExclamationTokenableNodeStructure, InitializerExpressionableNodeStructure, TypedNodeStructure } from "../base";

export interface VariableDeclarationStructure extends BindingNamedNodeStructure, InitializerExpressionableNodeStructure, TypedNodeStructure, ExclamationTokenableNodeStructure {
}
