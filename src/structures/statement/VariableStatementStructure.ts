import {VariableDeclarationType} from "./../../compiler";
import {JSDocableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure} from "./../base";
import {VariableDeclarationStructure} from "./VariableDeclarationStructure";

export interface VariableStatementStructure extends VariableStatementSpecificStructure, JSDocableNodeStructure,
    AmbientableNodeStructure, ExportableNodeStructure {
}

export interface VariableStatementSpecificStructure {
    declarationType?: VariableDeclarationType;
    declarations: VariableDeclarationStructure[];
}
