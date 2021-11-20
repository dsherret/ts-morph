import { VariableDeclarationKind } from "../../compiler";
import { AmbientableNodeStructure, ExportableNodeStructure, JSDocableNodeStructure } from "../base";
import { KindedStructure, Structure } from "../Structure.generated";
import { StructureKind } from "../StructureKind";
import { OptionalKind } from "../types";
import { VariableDeclarationStructure } from "./VariableDeclarationStructure";

export interface VariableStatementStructure
  extends Structure, VariableStatementSpecificStructure, JSDocableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure
{
}

export interface VariableStatementSpecificStructure extends KindedStructure<StructureKind.VariableStatement> {
  declarationKind?: VariableDeclarationKind;
  declarations: OptionalKind<VariableDeclarationStructure>[];
}
