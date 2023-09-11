import { WriterFunction } from "../../types";
import { JSDocableNodeStructure } from "../base";
import { KindedStructure, Structure } from "../Structure.generated";
import { StructureKind } from "../StructureKind";

export interface ExportAssignmentStructure extends Structure, ExportAssignmentSpecificStructure, JSDocableNodeStructure {
}

export interface ExportAssignmentSpecificStructure extends KindedStructure<StructureKind.ExportAssignment> {
  isExportEquals?: boolean;
  expression: string | WriterFunction;
}
