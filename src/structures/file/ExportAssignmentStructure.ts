import CodeBlockWriter from "code-block-writer";

export interface ExportAssignmentStructure {
    isExportEquals?: boolean;
    expression: string | ((writer: CodeBlockWriter) => void);
}
