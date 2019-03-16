import { VariableDeclarationKind } from "../../compiler";
import { AmbientableNodeStructure, ExportableNodeStructure, JSDocableNodeStructure } from "../base";
import { VariableDeclarationStructure } from "./VariableDeclarationStructure";
import { Structure } from "../Structure";
import { StructureKind } from "../StructureKind";

export interface VariableStatementStructure extends VariableStatementSpecificStructure, JSDocableNodeStructure,
    AmbientableNodeStructure, ExportableNodeStructure {
}

export interface VariableStatementSpecificStructure extends Structure<StructureKind.VariableStatement> {
    declarationKind?: VariableDeclarationKind;
    declarations: VariableDeclarationStructure[];
}
