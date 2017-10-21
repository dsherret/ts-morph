import {VariableDeclarationType} from "./../../compiler";
import {DocumentationableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure} from "./../base";
import {VariableDeclarationStructure} from "./VariableDeclarationStructure";

export interface VariableStatementStructure extends VariableStatementSpecificStructure, DocumentationableNodeStructure,
    AmbientableNodeStructure, ExportableNodeStructure {
}

export interface VariableStatementSpecificStructure {
    declarationType?: VariableDeclarationType;
    declarations: VariableDeclarationStructure[];
}
