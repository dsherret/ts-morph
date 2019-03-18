import { BindingNamedNodeStructure, ExclamationTokenableNodeStructure, InitializerExpressionableNodeStructure, TypedNodeStructure } from "../base";
import { Structure } from "../Structure";

export interface VariableDeclarationStructure
    extends Structure, VariableDeclarationSpecificStructure, BindingNamedNodeStructure, InitializerExpressionableNodeStructure, TypedNodeStructure,
        ExclamationTokenableNodeStructure
{
}

export interface VariableDeclarationSpecificStructure {
}
