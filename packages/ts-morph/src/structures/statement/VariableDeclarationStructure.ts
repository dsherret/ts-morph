import { BindingNamedNodeStructure, ExclamationTokenableNodeStructure, InitializerExpressionableNodeStructure, TypedNodeStructure } from "../base";
import { Structure, KindedStructure } from "../Structure";
import { StructureKind } from "../StructureKind";

export interface VariableDeclarationStructure
    extends Structure, VariableDeclarationSpecificStructure, BindingNamedNodeStructure, InitializerExpressionableNodeStructure, TypedNodeStructure,
        ExclamationTokenableNodeStructure
{
}

export interface VariableDeclarationSpecificStructure extends KindedStructure<StructureKind.VariableDeclaration> {
}
