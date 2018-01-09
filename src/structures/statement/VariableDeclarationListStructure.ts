import {VariableDeclarationType} from "./../../compiler";
import {VariableDeclarationStructure} from "./VariableDeclarationStructure";

export interface VariableDeclarationListStructure extends VariableDeclarationListSpecificStructure {
}

export interface VariableDeclarationListSpecificStructure {
    declarationType?: VariableDeclarationType;
    declarations: VariableDeclarationStructure[];
}
