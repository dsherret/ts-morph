import { VariableDeclarationKind } from "../../compiler";
import { AmbientableNodeStructure, ExportableNodeStructure, JSDocableNodeStructure } from "../base";
import { VariableDeclarationStructure } from "./VariableDeclarationStructure";

export interface VariableStatementStructure extends VariableStatementSpecificStructure, JSDocableNodeStructure,
    AmbientableNodeStructure, ExportableNodeStructure {
}

export interface VariableStatementSpecificStructure {
    declarationKind?: VariableDeclarationKind;
    declarations: VariableDeclarationStructure[];
}
