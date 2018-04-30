import { WriterFunction } from "../../types";

export interface ExportAssignmentStructure {
    isExportEquals?: boolean;
    expression: string | WriterFunction;
}
