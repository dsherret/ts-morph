import { WriterFunction } from "../../types";
import { Structure } from "../Structure";
import { StructureKind } from "../StructureKind";

export interface ExportAssignmentStructure extends Structure<StructureKind.ExportAssignment> {
    isExportEquals?: boolean;
    expression: string | WriterFunction;
}
