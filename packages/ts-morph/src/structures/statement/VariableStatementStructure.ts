import { VariableDeclarationKind } from "../../compiler";
import { AmbientableNodeStructure, ExportableNodeStructure, JSDocableNodeStructure } from "../base";
import { VariableDeclarationStructure } from "./VariableDeclarationStructure";
import { Structure, KindedStructure } from "../Structure";
import { StructureKind } from "../StructureKind";
import { OptionalKind } from "../types";

export interface VariableStatementStructure
    extends Structure, VariableStatementSpecificStructure, JSDocableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure
{
}

export interface VariableStatementSpecificStructure extends KindedStructure<StructureKind.VariableStatement> {
    declarationKind?: VariableDeclarationKind;
    declarations: OptionalKind<VariableDeclarationStructure>[];
}
