import { WriterFunction } from "../../types";
import { Structure, KindedStructure } from "../Structure";
import { StructureKind } from "../StructureKind";

export interface ExportAssignmentStructure extends Structure, ExportAssignmentSpecificStructure {
}

export interface ExportAssignmentSpecificStructure extends KindedStructure<StructureKind.ExportAssignment> {
    isExportEquals?: boolean;
    expression: string | WriterFunction;
}
