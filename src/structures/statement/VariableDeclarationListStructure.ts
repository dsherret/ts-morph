import { VariableDeclarationKind } from "../../compiler";
import { VariableDeclarationStructure } from "./VariableDeclarationStructure";

export interface VariableDeclarationListStructure extends VariableDeclarationListSpecificStructure {
}

export interface VariableDeclarationListSpecificStructure {
    declarationKind?: VariableDeclarationKind;
    declarations: VariableDeclarationStructure[];
}
