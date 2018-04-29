import { CodeBlockWriter } from "../../codeBlockWriter";

export interface ExportAssignmentStructure {
    isExportEquals?: boolean;
    expression: string | ((writer: CodeBlockWriter) => void);
}
