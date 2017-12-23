import CodeBlockWriter from "code-block-writer";

export interface ExportAssignmentStructure {
    isEqualsExport?: boolean;
    expression: string | ((writer: CodeBlockWriter) => void);
}
